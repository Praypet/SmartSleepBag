import torch
import numpy as np
from torch.utils.data import TensorDataset, DataLoader

# ===================== 模型定义（必须和训练一致）=====================
class SleepAttention(torch.nn.Module):
    def __init__(self, hidden_dim):
        super().__init__()
        self.attn = torch.nn.Linear(hidden_dim, 1)
    def forward(self, x):
        weights = torch.nn.functional.softmax(self.attn(x), dim=1)
        return torch.sum(x * weights, dim=1), weights

class InfantSleepNet(torch.nn.Module):
    def __init__(self):
        super().__init__()
        self.conv = torch.nn.Sequential(
            torch.nn.Conv1d(3, 32, 5, padding=2), torch.nn.BatchNorm1d(32), torch.nn.ReLU(),
            torch.nn.MaxPool1d(2),
            torch.nn.Conv1d(32, 64, 3, padding=1), torch.nn.BatchNorm1d(64), torch.nn.ReLU(),
            torch.nn.MaxPool1d(2)
        )
        self.lstm = torch.nn.LSTM(64, 128, 2, batch_first=True, bidirectional=True)
        self.attention = SleepAttention(256)
        self.fc = torch.nn.Linear(256, 4)

    def forward(self, x):
        x = self.conv(x).transpose(1, 2)
        x, _ = self.lstm(x)
        x, weights = self.attention(x)
        return self.fc(x), weights
# =====================================================================

# 睡眠分期检测
def detect_sleep_stage(signal_data):
    # 1. 加载模型
    model = InfantSleepNet()
    model.load_state_dict(torch.load('infant_sleep_model.pth', map_location='cpu'))
    model.eval()

    # 2. 数据预处理
    X = np.array(signal_data).reshape(1, 3, 100)
    X = (X - X.mean()) / X.std()
    X_tensor = torch.from_numpy(X).float()

    # 3. 预测
    with torch.no_grad():
        out, _ = model(X_tensor)
        pred = torch.argmax(out, dim=1).item()

    # 4. 睡眠阶段标签
    sleep_labels = {0: "清醒", 1: "快速眼动睡眠(REM)", 2: "浅睡眠", 3: "深睡眠"}
    result = sleep_labels[pred]

    print(f"="*60)
    print(f"【婴儿睡眠分期结果】")
    print(f"当前状态: {result}")
    print(f"="*60)
    return result

# ===================== 使用示例 =====================
if __name__ == "__main__":
    # 生成一段模拟信号（3通道×100长度，和训练数据一致）
    test_signal = np.random.randn(3, 100)
    detect_sleep_stage(test_signal)