import os
import librosa
import numpy as np
import pandas as pd
import pickle
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import classification_report, f1_score, precision_score, recall_score
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import confusion_matrix, classification_report
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import Dense, Dropout, Conv2D, MaxPooling2D, GlobalAveragePooling2D
from tensorflow.keras.utils import to_categorical
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping
from datetime import datetime

# 设置中文字体（防止画图乱码，Windows环境通常用黑体SimHei）
plt.rcParams['font.sans-serif'] = ['SimHei'] 
plt.rcParams['axes.unicode_minus'] = False

# ==========================================
# 1. 配置路径
# ==========================================
RAW_DATA_PATH = './work/train/' 
MODEL_SAVE_PATH = './saved_models/baby_sound_cnn_best.h5'
PICKLE_PATH = 'featuresdf_cnn.txt'
max_pad_len = 500 

# ==========================================
# 2. 特征提取
# ==========================================
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
        print(f"提取特征出错: {file_name}, 错误信息: {e}")
        return None 
    return mfccs

def prepare_data(data_path):
    features = []
    categories = [d for d in os.listdir(data_path) if os.path.isdir(os.path.join(data_path, d))]
    print(f"检测到类别: {categories}")
    for category in categories:
        cat_path = os.path.join(data_path, category)
        files = [f for f in os.listdir(cat_path) if f.endswith('.wav')]
        print(f"正在读取类别: {category}，共 {len(files)} 个文件")
        for f in files:
            file_full_path = os.path.join(cat_path, f)
            data = extract_features(file_full_path)
            if data is not None:
                features.append([data, category])
                
    featuresdf = pd.DataFrame(features, columns=['feature', 'class_label'])
    with open(PICKLE_PATH, 'wb') as f:
        pickle.dump(featuresdf, f)
    return featuresdf

# ==========================================
# 3. 构建 CNN 模型
# ==========================================
def build_model(num_labels):
    model = Sequential([
        Conv2D(16, 2, input_shape=(40, 500, 1), activation='relu'),
        MaxPooling2D(2),
        Dropout(0.2),

        Conv2D(32, 2, activation='relu'),
        MaxPooling2D(2),
        Dropout(0.2),

        Conv2D(64, 2, activation='relu'),
        MaxPooling2D(2),
        Dropout(0.2),

        Conv2D(128, 2, activation='relu'),
        MaxPooling2D(2),
        Dropout(0.2),

        GlobalAveragePooling2D(),
        Dense(num_labels, activation='softmax')
    ])
    model.compile(loss='categorical_crossentropy', metrics=['accuracy'], optimizer='adam')
    return model

# ==========================================
# 4. 增强评估函数 
# ==========================================
def plot_advanced_evaluation(model, x_test, y_test, le):  # 函数定义只有4个参数
    # 1. 获取预测值
    y_pred_prob = model.predict(x_test, verbose=0)  # 关闭预测过程的输出
    y_pred = np.argmax(y_pred_prob, axis=1)
    y_true = np.argmax(y_test, axis=1)

    # 2. 打印最核心的文本报告
    # 包含每个类别的 Precision, Recall, F1-score
    report = classification_report(y_true, y_pred, target_names=le.classes_)
    print("\n" + "="*60)
    print("详细分类评估报告 (Classification Report):")
    print(report)
    print("="*60)

    # 3. 绘制混淆矩阵
    plt.figure(figsize=(10, 8))
    cm = confusion_matrix(y_true, y_pred)
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                xticklabels=le.classes_, yticklabels=le.classes_)
    plt.title('模型混淆矩阵 - 评估预测偏好', fontsize=14)
    plt.xlabel('模型预测结果', fontsize=12)
    plt.ylabel('实际真实标签', fontsize=12)
    plt.tight_layout()  # 防止标签被截断
    plt.savefig('confusion_matrix_final.png', dpi=300)
    
    # 4. 提取整体 F1-score 供 PPT 展示
    total_f1 = f1_score(y_true, y_pred, average='weighted')
    print(f"模型综合 F1-Score: {total_f1:.4f}")
    
    plt.show()

def plot_history(history):
    """绘制训练过程中的准确率和损失曲线"""
    acc = history.history['accuracy']
    val_acc = history.history['val_accuracy']
    loss = history.history['loss']
    val_loss = history.history['val_loss']
    epochs_range = range(len(acc))

    plt.figure(figsize=(15, 5))

    # 绘制准确率曲线
    plt.subplot(1, 2, 1)
    plt.plot(epochs_range, acc, label='Train Acc', lw=2)
    plt.plot(epochs_range, val_acc, label='Val Acc', lw=2)
    plt.title('模型准确率收敛曲线')
    plt.xlabel('训练轮次 (Epoch)')
    plt.ylabel('准确率 (Accuracy)')
    plt.legend(loc='lower right')
    plt.grid(True, linestyle='--', alpha=0.5)

    # 绘制损失曲线
    plt.subplot(1, 2, 2)
    plt.plot(epochs_range, loss, label='Train Loss', color='red', lw=2)
    plt.plot(epochs_range, val_loss, label='Val Loss', color='green', lw=2)
    plt.title('模型损失下降曲线')
    plt.xlabel('训练轮次 (Epoch)')
    plt.ylabel('损失值 (Loss)')
    plt.legend(loc='upper right')
    plt.grid(True, linestyle='--', alpha=0.5)

    plt.tight_layout()
    plt.savefig('training_history.png', dpi=300) # 自动保存该图
    plt.show()

# ==========================================
# 5. 主程序运行
# ==========================================
if __name__ == "__main__":
    # 1. 加载数据
    if os.path.exists(PICKLE_PATH):
        print("从本地加载已保存的特征文件...")
        with open(PICKLE_PATH, 'rb') as f:
            featuresdf = pickle.load(f)
    else:
        featuresdf = prepare_data(RAW_DATA_PATH)

    # 2. 预处理
    X = np.array(featuresdf.feature.tolist())
    y = np.array(featuresdf.class_label.tolist())
    le = LabelEncoder()
    yy = to_categorical(le.fit_transform(y))
    
    x_train, x_test, y_train, y_test = train_test_split(X, yy, test_size=0.2, random_state=42)
    x_train = x_train.reshape(x_train.shape[0], 40, 500, 1)
    x_test = x_test.reshape(x_test.shape[0], 40, 500, 1)

    # 3. 训练
    model = build_model(len(le.classes_))
    
    # 如果 saved_models 目录不存在则创建
    if not os.path.exists('saved_models'): 
        os.makedirs('saved_models')
    
    checkpointer = ModelCheckpoint(filepath=MODEL_SAVE_PATH, verbose=1, save_best_only=True)  # 开启保存提示
    early_stop = EarlyStopping(monitor='val_loss', patience=20) 

    print("\n开始训练模型...")
    history = model.fit(x_train, y_train, 
                        batch_size=128, 
                        epochs=300, 
                        validation_data=(x_test, y_test), 
                        callbacks=[checkpointer, early_stop], 
                        verbose=1)
    plot_history(history)  
    model.save('baby_cry_model.h5')
    print("哭声识别模型已成功保存为 baby_cry_model.h5")

    # 保存LabelEncoder
    with open('label_encoder.pkl', 'wb') as f:
        pickle.dump(le, f)

    # 4. 运行增强评估
    best_model = load_model(MODEL_SAVE_PATH)
    plot_advanced_evaluation(best_model, x_test, y_test, le)  