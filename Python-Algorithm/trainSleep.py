import torch
import torch.nn as nn
import torch.nn.functional as F
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset, random_split
import matplotlib.pyplot as plt
import numpy as np
import os
from datetime import datetime

# 配置参数
class Config:
    seed = 42
    num_classes = 4
    input_channels = 3
    sequence_len = 100
    num_samples = 1500
    batch_size = 32
    lr = 0.0003
    epochs = 80
    device = "cuda" if torch.cuda.is_available() else "cpu"

    save_dir = "runsSleep"
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    save_path = os.path.join(save_dir, timestamp)

# 固定随机种子
np.random.seed(Config.seed)
torch.manual_seed(Config.seed)
os.makedirs(Config.save_path, exist_ok=True)

# 生成模拟睡眠数据
def generate_realistic_sleep_data():
    X = np.zeros((Config.num_samples, Config.input_channels, Config.sequence_len))
    y = np.random.randint(0, Config.num_classes, Config.num_samples)
    t = np.linspace(0, 1, Config.sequence_len)

    for i in range(Config.num_samples):
        # 基线漂移
        baseline = np.linspace(np.random.normal(0, 0.3), np.random.normal(0, 0.3), Config.sequence_len)
        
        if y[i] == 0:  # 清醒：高频大幅度抖动
            sig = 1.8 * np.sin(2 * np.pi * 12 * t) + np.random.normal(0, 0.5, Config.sequence_len)
        elif y[i] == 1:  # REM：中幅波动
            sig = 1.2 * np.sin(2 * np.pi * 6 * t) + np.random.normal(0, 0.4, Config.sequence_len)
        elif y[i] == 2:  # 浅睡：小幅低频
            sig = 0.6 * np.sin(2 * np.pi * 3 * t) + np.random.normal(0, 0.3, Config.sequence_len)
        else:  # 深睡：极平稳
            sig = 0.2 * np.sin(2 * np.pi * 1.5 * t) + np.random.normal(0, 0.2, Config.sequence_len)
        
        # 每个通道略有差异
        for c in range(Config.input_channels):
            X[i, c] = sig + baseline + np.random.normal(0, 0.2, Config.sequence_len)

    # 标准化
    X = (X - X.mean()) / X.std()
    X_tensor = torch.tensor(X, dtype=torch.float32)
    y_tensor = torch.tensor(y, dtype=torch.long)

    dataset = TensorDataset(X_tensor, y_tensor)
    train_size = int(0.8 * len(dataset))
    val_size = len(dataset) - train_size
    train_ds, val_ds = random_split(dataset, [train_size, val_size])

    train_loader = DataLoader(train_ds, batch_size=Config.batch_size, shuffle=True)
    val_loader = DataLoader(val_ds, batch_size=Config.batch_size, shuffle=False)

    return train_loader, val_loader

# 注意力模块
class SleepAttention(nn.Module):
    def __init__(self, hidden_dim):
        super().__init__()
        self.attn = nn.Linear(hidden_dim, 1)
    def forward(self, x):
        attn_weights = F.softmax(self.attn(x), dim=1)
        weighted_sum = torch.sum(x * attn_weights, dim=1)
        return weighted_sum, attn_weights

# 模型
class InfantSleepNet(nn.Module):
    def __init__(self):
        super().__init__()
        self.conv = nn.Sequential(
            nn.Conv1d(3, 32, 5, padding=2), nn.BatchNorm1d(32), nn.ReLU(), nn.MaxPool1d(2),
            nn.Conv1d(32, 64, 3, padding=1), nn.BatchNorm1d(64), nn.ReLU(), nn.MaxPool1d(2)
        )
        self.lstm = nn.LSTM(64, 128, 2, batch_first=True, bidirectional=True)
        self.attention = SleepAttention(256)
        self.fc = nn.Linear(256, Config.num_classes)

    def forward(self, x):
        x = self.conv(x).transpose(1, 2)
        x, _ = self.lstm(x)
        x, _ = self.attention(x)
        return self.fc(x), _

# 训练 & 验证
def train_one_epoch(model, loader, criterion, optimizer, device):
    model.train()
    total_loss, correct, total = 0,0,0
    for data, label in loader:
        data, label = data.to(device), label.to(device)
        optimizer.zero_grad()
        out, _ = model(data)
        loss = criterion(out, label)
        loss.backward()
        optimizer.step()
        total_loss += loss.item()
        correct += (out.argmax(1)==label).sum().item()
        total += label.size(0)
    return total_loss/len(loader), 100*correct/total

def val_one_epoch(model, loader, criterion, device):
    model.eval()
    total_loss, correct, total = 0,0,0
    with torch.no_grad():
        for data, label in loader:
            data, label = data.to(device), label.to(device)
            out, _ = model(data)
            loss = criterion(out, label)
            total_loss += loss.item()
            correct += (out.argmax(1)==label).sum().item()
            total += label.size(0)
    return total_loss/len(loader), 100*correct/total

# 绘图
def plot_curves(history):
    plt.rcParams['font.sans-serif'] = ['SimHei']
    plt.rcParams['axes.unicode_minus'] = False
    fig, (ax1, ax2) = plt.subplots(1,2,figsize=(15,5))
    ax1.plot(history['train_acc'], label='训练', lw=2)
    ax1.plot(history['val_acc'], label='验证', lw=2, ls='--')
    ax1.set_title('准确率变化')
    ax1.legend()
    ax1.grid(alpha=0.3)

    ax2.plot(history['train_loss'], label='训练损失', lw=2)
    ax2.plot(history['val_loss'], label='验证损失', lw=2, ls='--')
    ax2.set_title('损失变化')
    ax2.legend()
    ax2.grid(alpha=0.3)

    plt.tight_layout()
    plt.savefig(os.path.join(Config.save_path, "curves.png"), dpi=300)
    plt.close()

# 主函数
def main():
    print(f"设备: {Config.device}")
    print(f"保存路径: {Config.save_path}\n")

    train_loader, val_loader = generate_realistic_sleep_data()
    model = InfantSleepNet().to(Config.device)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=Config.lr)

    history = {'train_acc':[],'val_acc':[],'train_loss':[],'val_loss':[]}
    best_val_acc = 0.0  # 记录最好模型

    print("开始训练\n")
    for epoch in range(1, Config.epochs+1):
        t_loss, t_acc = train_one_epoch(model, train_loader, criterion, optimizer, Config.device)
        v_loss, v_acc = val_one_epoch(model, val_loader, criterion, Config.device)

        history['train_acc'].append(t_acc)
        history['val_acc'].append(v_acc)
        history['train_loss'].append(t_loss)
        history['val_loss'].append(v_loss)

        # 保存 验证集 最好模型
        if v_acc > best_val_acc:
            best_val_acc = v_acc
            torch.save(model.state_dict(), os.path.join(Config.save_path, "best.pth"))
            
        print(f"Epoch [{epoch:02d}/{Config.epochs}] | "
              f"Train Acc: {t_acc:.2f}% | Val Acc: {v_acc:.2f}% | "
              f"Train Loss: {t_loss:.3f} | Val Loss: {v_loss:.3f}")

    plot_curves(history)
    print(f"\n训练完成！最佳验证准确率: {best_val_acc:.2f}%")

if __name__ == "__main__":
    main()