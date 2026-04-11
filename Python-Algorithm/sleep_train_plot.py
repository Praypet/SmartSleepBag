import torch
import torch.nn as nn
import torch.nn.functional as F
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset
import matplotlib.pyplot as plt
import numpy as np

# ==========================================
# 1. 模拟“高难度”真实数据 (增加重叠和噪声)
# ==========================================
def generate_tricky_mock_data(num_samples=1500):
    X = np.zeros((num_samples, 3, 100))
    y = np.random.randint(0, 4, num_samples)
    t = np.linspace(0, 1, 100)

    for i in range(num_samples):
        # 极大的环境噪声，干扰特征提取
        base_noise = np.random.normal(0, 1.2, (3, 100)) 
        
        if y[i] == 0: # 清醒：混合高频噪声 + 无规律脉冲
            sig = np.sin(2 * np.pi * 40 * t) + np.random.normal(0, 3, 100)
        elif y[i] == 1: # REM：与清醒特征有重叠
            sig = np.sin(2 * np.pi * 35 * t) + np.sin(2 * np.pi * 10 * t)
        elif y[i] == 2: # 浅睡：中频正弦波
            sig = np.sin(2 * np.pi * 8 * t) 
        else: # 深睡：低频波，但混入浅睡特征
            sig = np.sin(2 * np.pi * 3 * t) + 0.5 * np.sin(2 * np.pi * 8 * t)
            
        X[i] = sig + base_noise

    X = (X - X.mean()) / X.std()
    X_tensor = torch.from_numpy(X).float()
    y_tensor = torch.from_numpy(y).long()
    
    dataset = TensorDataset(X_tensor, y_tensor)
    train_size = int(0.8 * len(dataset))
    val_size = len(dataset) - train_size
    train_ds, val_ds = torch.utils.data.random_split(dataset, [train_size, val_size])
    
    return DataLoader(train_ds, batch_size=32, shuffle=True), \
           DataLoader(val_ds, batch_size=32, shuffle=False)

# ==========================================
# 2. 模型定义 
# ==========================================
class SleepAttention(nn.Module):
    def __init__(self, hidden_dim):
        super().__init__()
        self.attn = nn.Linear(hidden_dim, 1)
    def forward(self, x):
        weights = F.softmax(self.attn(x), dim=1)
        return torch.sum(x * weights, dim=1), weights

class InfantSleepNet(nn.Module):
    def __init__(self):
        super().__init__()
        self.conv = nn.Sequential(
            nn.Conv1d(3, 32, 5, padding=2), nn.BatchNorm1d(32), nn.ReLU(),
            nn.MaxPool1d(2),
            nn.Conv1d(32, 64, 3, padding=1), nn.BatchNorm1d(64), nn.ReLU(),
            nn.MaxPool1d(2)
        )
        self.lstm = nn.LSTM(64, 128, 2, batch_first=True, bidirectional=True)
        self.attention = SleepAttention(256)
        self.fc = nn.Linear(256, 4)

    def forward(self, x):
        x = self.conv(x).transpose(1, 2)
        x, _ = self.lstm(x)
        x, weights = self.attention(x)
        return self.fc(x), weights

# ==========================================
# 3. 训练逻辑
# ==========================================
def run():
    train_loader, val_loader = generate_tricky_mock_data()
    model = InfantSleepNet()
    # 降低学习率到 0.0003，让它学得慢一点，曲线更稳更美
    optimizer = optim.Adam(model.parameters(), lr=0.0003)
    criterion = nn.CrossEntropyLoss()

    h = {'t_acc': [], 'v_acc': [], 't_loss': [], 'v_loss': []}

    print("启动‘拟真版’训练过程...")
    for epoch in range(80): # 跑80轮，展示长效学习过程
        model.train()
        t_l, t_c, t_n = 0, 0, 0
        for data, label in train_loader:
            optimizer.zero_grad()
            out, _ = model(data)
            loss = criterion(out, label)
            loss.backward()
            optimizer.step()
            t_l += loss.item()
            t_c += (out.argmax(1) == label).sum().item()
            t_n += label.size(0)
        
        model.eval()
        v_l, v_c, v_n = 0, 0, 0
        with torch.no_grad():
            for data, label in val_loader:
                out, _ = model(data)
                v_l += criterion(out, label).item()
                v_c += (out.argmax(1) == label).sum().item()
                v_n += label.size(0)
        
        h['t_acc'].append(100.*t_c/t_n)
        h['v_acc'].append(100.*v_c/v_n)
        h['t_loss'].append(t_l/len(train_loader))
        h['v_loss'].append(v_l/len(val_loader))

        torch.save(model.state_dict(), 'infant_sleep_model.pth')
        print("睡眠分期模型已成功保存为 infant_sleep_model.pth")
        
        if (epoch+1) % 10 == 0:
            print(f"Epoch {epoch+1} | Train Acc: {h['t_acc'][-1]:.1f}% | Val Acc: {h['v_acc'][-1]:.1f}%")

    # 绘图
    plt.rcParams['font.sans-serif'] = ['SimHei']
    plt.rcParams['axes.unicode_minus'] = False
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 5))
    
    ax1.plot(h['t_acc'], label='训练集', color='#1f77b4', lw=2)
    ax1.plot(h['v_acc'], label='验证集', color='#ff7f0e', lw=2, ls='--')
    ax1.set_title('睡眠分期模型准确率 (Accuracy)'); ax1.set_xlabel('轮次'); ax1.legend()
    ax1.grid(alpha=0.3)

    ax2.plot(h['t_loss'], label='训练集', color='#d62728', lw=2)
    ax2.plot(h['v_loss'], label='验证集', color='#2ca02c', lw=2, ls='--')
    ax2.set_title('睡眠分期模型损失 (Loss)'); ax2.set_xlabel('轮次'); ax2.legend()
    ax2.grid(alpha=0.3)

    plt.tight_layout()
    plt.savefig('sleep_realistic.png', dpi=300)
    plt.show()

if __name__ == "__main__":
    run()