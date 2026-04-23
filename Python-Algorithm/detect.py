import numpy as np
import librosa
import pickle
import torch

# 配置
# 哭声检测
MAX_PAD_LEN = 500
CRY_MODEL_PATH = "best.keras"
LABEL_ENCODER_PATH = "label_encoder.pkl"

# 睡眠分期
SLEEP_MODEL_PATH = "best.pth"
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

# 模型加载
# 哭声模型
from tensorflow.keras.models import load_model
cry_model = load_model(CRY_MODEL_PATH)
with open(LABEL_ENCODER_PATH, "rb") as f:
    label_encoder = pickle.load(f)

# 睡眠模型
class SleepAttention(torch.nn.Module):
    def __init__(self, hidden_dim):
        super().__init__()
        self.attn = torch.nn.Linear(hidden_dim, 1)
    def forward(self, x):
        attn_weights = torch.nn.functional.softmax(self.attn(x), dim=1)
        weighted_sum = torch.sum(x * attn_weights, dim=1)
        return weighted_sum, attn_weights

class InfantSleepNet(torch.nn.Module):
    def __init__(self):
        super().__init__()
        self.conv = torch.nn.Sequential(
            torch.nn.Conv1d(3, 32, 5, padding=2),
            torch.nn.BatchNorm1d(32),
            torch.nn.ReLU(),
            torch.nn.MaxPool1d(2),

            torch.nn.Conv1d(32, 64, 3, padding=1),
            torch.nn.BatchNorm1d(64),
            torch.nn.ReLU(),
            torch.nn.MaxPool1d(2)
        )
        self.lstm = torch.nn.LSTM(64, 128, 2, batch_first=True, bidirectional=True)
        self.attention = SleepAttention(256)
        self.fc = torch.nn.Linear(256, 4)

    def forward(self, x):
        x = self.conv(x).transpose(1, 2)
        x, _ = self.lstm(x)
        x, _ = self.attention(x)
        return self.fc(x), _

sleep_model = InfantSleepNet().to(DEVICE)
sleep_model.load_state_dict(torch.load(SLEEP_MODEL_PATH, map_location=DEVICE))
sleep_model.eval()

# 哭声检测
def extract_mfcc(audio_data, sample_rate=22050):
    try:
        mfccs = librosa.feature.mfcc(y=audio_data, sr=sample_rate, n_mfcc=40)
        if mfccs.shape[1] < MAX_PAD_LEN:
            mfccs = np.pad(mfccs, ((0,0), (0, MAX_PAD_LEN - mfccs.shape[1])), mode="constant")
        else:
            mfccs = mfccs[:, :MAX_PAD_LEN]
        return mfccs
    except:
        return None

def detect_cry(audio_data, sample_rate=22050):
    feat = extract_mfcc(audio_data, sample_rate)
    if feat is None:
        return "error", 0.0

    feat = feat.reshape(1, 40, MAX_PAD_LEN, 1)
    pred = cry_model.predict(feat, verbose=0)
    class_idx = np.argmax(pred)
    label = label_encoder.inverse_transform([class_idx])[0]
    confidence = float(pred[0][class_idx]) * 100
    return label, round(confidence, 2)

# 从本地 WAV 文件检测
def detect_cry_from_file(file_path):
    try:
        audio, sr = librosa.load(file_path, sr=22050)
        return detect_cry(audio, sr)
    except Exception as e:
        print("读取文件失败", e)
        return "error", 0.0

# 睡眠分期
def detect_sleep(pvdf_data):
    try:
        x = torch.tensor(pvdf_data, dtype=torch.float32).unsqueeze(0).to(DEVICE)
        with torch.no_grad():
            out, _ = sleep_model(x)
        pred = torch.softmax(out, dim=1)
        class_idx = torch.argmax(pred).item()
        confidence = float(pred[0][class_idx]) * 100
        sleep_classes = ["清醒", "REM", "浅睡", "深睡"]
        return sleep_classes[class_idx], round(confidence, 2)
    except:
        return "error", 0.0

if __name__ == "__main__":
    print("=== 正在检测音频文件：test_163.wav ===")
    label, confidence = detect_cry_from_file("test_163.wav")
    print(f"识别结果：{label}")
    print(f"置信度：{confidence}%")