import os
import librosa
import numpy as np
import pickle
from tensorflow.keras.models import load_model

# ===================== 配置参数=====================
max_pad_len = 500
MODEL_PATH = 'baby_sound_cnn_best.h5'          # 哭声模型
ENCODER_PATH = 'label_encoder.pkl'         # 标签编码器
# =====================================================================

# 特征提取函数
def extract_features(file_name):
    try:
        audio, sample_rate = librosa.load(file_name, res_type='kaiser_fast')
        mfccs = librosa.feature.mfcc(y=audio, sr=sample_rate, n_mfcc=40)

        pad_width = max_pad_len - mfccs.shape[1]
        if pad_width > 0:
            mfccs = np.pad(mfccs, pad_width=((0, 0), (0, pad_width)), mode='constant')
        else:
            mfccs = mfccs[:, :max_pad_len]
    except Exception as e:
        print(f"读取音频失败: {e}")
        return None
    return mfccs

# 哭声检测主函数
def detect_baby_cry(audio_path):
    # 1. 加载模型和标签
    model = load_model(MODEL_PATH)
    with open(ENCODER_PATH, 'rb') as f:
        le = pickle.load(f)

    # 2. 提取特征
    feat = extract_features(audio_path)
    if feat is None:
        return "检测失败"

    # 3. 数据形状适配CNN输入
    feat = feat.reshape(1, 40, 500, 1)

    # 4. 预测
    pred = model.predict(feat, verbose=0)
    pred_class = np.argmax(pred, axis=1)[0]
    pred_label = le.inverse_transform([pred_class])[0]
    confidence = pred[0][pred_class] * 100

    # 5. 输出结果
    print(f"="*60)
    print(f"【婴儿哭声识别结果】")
    print(f"音频文件: {os.path.basename(audio_path)}")
    print(f"识别类别: {pred_label}")
    print(f"置信度: {confidence:.2f}%")
    print(f"="*60)
    return pred_label, confidence

# ===================== 使用示例 =====================
if __name__ == "__main__":
    # 把这里换成你要检测的 wav 音频路径
    TEST_AUDIO = "test3_cry.wav"
    detect_baby_cry(TEST_AUDIO)