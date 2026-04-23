# 婴儿哭声识别 - 增量学习系统
# 功能：原始数据 + 用户反馈数据 → 合并训练 → 模型对比 → 自动择优更新

import os
import librosa
import numpy as np
import pandas as pd
import pickle
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import classification_report, f1_score, accuracy_score
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import confusion_matrix
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import Dense, Dropout, Conv2D, MaxPooling2D, GlobalAveragePooling2D
from tensorflow.keras.utils import to_categorical
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping
from datetime import datetime

# 配置
RAW_DATA_PATH = './work/train/'
USER_FEEDBACK_PATH = './user_feedback/'
OLD_MODEL_PATH = 'best.keras'
NEW_MODEL_PATH = 'best_new.keras'
LABEL_ENCODER_PATH = 'label_encoder.pkl'

max_pad_len = 500
TEST_SIZE = 0.2
RANDOM_STATE = 42

# 特征提取
def extract_features(file_name):
    try:
        audio, sr = librosa.load(file_name, res_type='kaiser_fast')
        mfccs = librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=40)
        if mfccs.shape[1] < max_pad_len:
            mfccs = np.pad(mfccs, ((0,0),(0, max_pad_len - mfccs.shape[1])), mode='constant')
        else:
            mfccs = mfccs[:,:max_pad_len]
        return mfccs
    except:
        return None

# 加载数据
def load_data(path, cache_path):
    if os.path.exists(cache_path):
        with open(cache_path, 'rb') as f:
            return pickle.load(f)
    feats = []
    for label in os.listdir(path):
        p = os.path.join(path, label)
        if not os.path.isdir(p): continue
        for f in os.listdir(p):
            if f.endswith('.wav'):
                feat = extract_features(os.path.join(p, f))
                if feat is not None:
                    feats.append([feat, label])
    df = pd.DataFrame(feats, columns=['feature', 'class_label'])
    with open(cache_path, 'wb') as f:
        pickle.dump(df, f)
    return df

# 构建模型
def build_model(num_classes):
    model = Sequential([
        Conv2D(16, (2,2), activation='relu', input_shape=(40,500,1)),
        MaxPooling2D((2,2)),
        Dropout(0.2),
        Conv2D(32, (2,2), activation='relu'),
        MaxPooling2D((2,2)),
        Dropout(0.2),
        Conv2D(64, (2,2), activation='relu'),
        MaxPooling2D((2,2)),
        Dropout(0.2),
        Conv2D(128, (2,2), activation='relu'),
        MaxPooling2D((2,2)),
        Dropout(0.2),
        GlobalAveragePooling2D(),
        Dense(num_classes, activation='softmax')
    ])
    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
    return model

# 评估 
def evaluate(model, x_test, y_test, le, name):
    y_pred = np.argmax(model.predict(x_test, verbose=0), axis=1)
    y_true = np.argmax(y_test, axis=1)
    acc = accuracy_score(y_true, y_pred)
    f1 = f1_score(y_true, y_pred, average='weighted')
    print(f"\n【{name}】acc={acc:.4f}, f1={f1:.4f}")
    print(classification_report(y_true, y_pred, target_names=le.classes_))
    return acc, f1

# 主程序
if __name__ == "__main__":
    print("🚀 增量学习系统启动")

    # 加载数据
    df_old = load_data(RAW_DATA_PATH, "cache_old.pkl")
    df_user = load_data(USER_FEEDBACK_PATH, "cache_user.pkl")
    df_all = pd.concat([df_old, df_user], ignore_index=True)
    print(f"✅ 总数据：{len(df_all)} 条")

    # 预处理
    X = np.array(df_all.feature.tolist())
    y = np.array(df_all.class_label.tolist())

    if os.path.exists(LABEL_ENCODER_PATH):
        with open(LABEL_ENCODER_PATH, 'rb') as f:
            le = pickle.load(f)
    else:
        le = LabelEncoder()
    y_cat = to_categorical(le.fit_transform(y))

    x_train, x_test, y_train, y_test = train_test_split(X, y_cat, test_size=TEST_SIZE, random_state=RANDOM_STATE)
    x_train = x_train.reshape(-1,40,500,1)
    x_test = x_test.reshape(-1,40,500,1)

    # 旧模型评估
    old_model = load_model(OLD_MODEL_PATH)
    acc_old, f1_old = evaluate(old_model, x_test, y_test, le, "旧模型")

    # 训练新模型
    new_model = build_model(len(le.classes_))
    new_model.fit(x_train, y_train, batch_size=128, epochs=50, validation_data=(x_test, y_test),
                  callbacks=[EarlyStopping(patience=10), ModelCheckpoint(NEW_MODEL_PATH, save_best_only=True)], verbose=1)

    # 新模型评估
    best_new = load_model(NEW_MODEL_PATH)
    acc_new, f1_new = evaluate(best_new, x_test, y_test, le, "新模型")

    # 模型择优
    if f1_new > f1_old:
        best_new.save(OLD_MODEL_PATH)
        with open(LABEL_ENCODER_PATH, 'wb') as f:
            pickle.dump(le, f)
        print("\n✅ 新模型更优，已覆盖上线模型")
    else:
        print("\n✅ 保留原模型")

    print("\n🎉 增量学习完成！")