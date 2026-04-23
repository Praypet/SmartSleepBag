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
from sklearn.metrics import confusion_matrix
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import Input, Dense, Dropout, Conv2D, MaxPooling2D, GlobalAveragePooling2D
from tensorflow.keras.utils import to_categorical
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping
from tensorflow.keras.optimizers import Adam
from datetime import datetime

# 设置中文字体
plt.rcParams['font.sans-serif'] = ['SimHei']
plt.rcParams['axes.unicode_minus'] = False

# 全局配置
class Config:
    RAW_TRAIN_PATH = './work/train/'       
    RAW_TEST_PATH = './work/test/'         
    SAVE_DIR = './runsCry/' + datetime.now().strftime("%Y%m%d_%H%M%S")
    MODEL_SAVE_PATH = os.path.join(SAVE_DIR, 'best.keras')
    LABEL_ENCODER_PATH = os.path.join(SAVE_DIR, 'label_encoder.pkl')
    HISTORY_PATH = os.path.join(SAVE_DIR, 'training_history.pkl')
    
    max_pad_len = 500                      # 音频特征统一长度
    n_mfcc = 40                            # MFCC 特征数量
    epochs = 300                           # 最大训练轮数
    batch_size = 64                        # 批次大小
    initial_lr = 0.001                     # 学习率
    patience_earlystop = 15                # 早停耐心值

os.makedirs(Config.SAVE_DIR, exist_ok=True)
print(f"所有结果将保存到: {Config.SAVE_DIR}")


# 特征提取函数
def extract_features(file_name):

    try:
        # 加载音频，自动统一采样率
        audio, sample_rate = librosa.load(file_name, res_type='kaiser_fast')
        
        # 提取 MFCC 特征
        mfccs = librosa.feature.mfcc(y=audio, sr=sample_rate, n_mfcc=Config.n_mfcc)
        
        # 统一特征长度为 500
        pad_width = Config.max_pad_len - mfccs.shape[1]
        if pad_width > 0:
            mfccs = np.pad(mfccs, pad_width=((0, 0), (0, pad_width)), mode='constant')
        else:
            mfccs = mfccs[:, :Config.max_pad_len]
            
    except Exception as e:
        print(f"提取特征出错: {file_name}, 错误信息: {e}")
        return None
    return mfccs


# 模型构建
def build_model(num_labels):

    model = Sequential([
        Input(shape=(Config.n_mfcc, Config.max_pad_len, 1)),

        # 第1组卷积：提取浅层特征
        Conv2D(16, (2, 2), activation='relu'),
        MaxPooling2D((2, 2)),
        Dropout(0.2),

        # 第2组卷积
        Conv2D(32, (2, 2), activation='relu'),
        MaxPooling2D((2, 2)),
        Dropout(0.2),

        # 第3组卷积
        Conv2D(64, (2, 2), activation='relu'),
        MaxPooling2D((2, 2)),
        Dropout(0.2),

        # 第4组卷积
        Conv2D(128, (2, 2), activation='relu'),
        MaxPooling2D((2, 2)),
        Dropout(0.2),

        # 全局池化 + 分类层
        GlobalAveragePooling2D(),
        Dense(num_labels, activation='softmax')
    ])

    # 编译模型
    model.compile(
        loss='categorical_crossentropy',
        metrics=['accuracy'],
        optimizer=Adam(learning_rate=Config.initial_lr)
    )
    model.summary()
    return model

# 评估与绘图函数
def plot_advanced_evaluation(model, x_test, y_test, le, save_dir):
    y_pred_prob = model.predict(x_test, verbose=1)
    y_pred = np.argmax(y_pred_prob, axis=1)
    y_true = np.argmax(y_test, axis=1)

    report = classification_report(y_true, y_pred, target_names=le.classes_)
    print("\n" + "="*60)
    print("详细分类评估报告")
    print(report)
    print("="*60)

    plt.figure(figsize=(10, 8))
    cm = confusion_matrix(y_true, y_pred)
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
                xticklabels=le.classes_, yticklabels=le.classes_)
    plt.title('混淆矩阵')
    plt.xlabel('预测')
    plt.ylabel('真实')
    plt.tight_layout()
    plt.savefig(os.path.join(save_dir, 'confusion_matrix_final.png'), dpi=300)
    plt.close()

    total_f1 = f1_score(y_true, y_pred, average='weighted')
    print(f"综合 F1-Score: {total_f1:.4f}")
    return total_f1

def plot_history(history, save_dir):
    acc = history.history['accuracy']
    val_acc = history.history['val_accuracy']
    loss = history.history['loss']
    val_loss = history.history['val_loss']
    epochs_range = range(len(acc))

    plt.figure(figsize=(15, 5))
    plt.subplot(1, 2, 1)
    plt.plot(epochs_range, acc, label='训练准确率')
    plt.plot(epochs_range, val_acc, label='验证准确率')
    plt.title('准确率曲线')
    plt.legend()
    plt.grid(True, linestyle='--')

    plt.subplot(1, 2, 2)
    plt.plot(epochs_range, loss, label='训练损失', color='red')
    plt.plot(epochs_range, val_loss, label='验证损失', color='green')
    plt.title('损失曲线')
    plt.legend()
    plt.grid(True, linestyle='--')

    plt.tight_layout()
    plt.savefig(os.path.join(save_dir, 'training_history.png'), dpi=300)
    plt.close()

def predict_unlabeled_test(model, le, save_dir):
    print("\n=== 开始预测无标签测试集 ===")
    test_files = [f for f in os.listdir(Config.RAW_TEST_PATH) if f.endswith('.wav')]
    results = []
    for f in test_files:
        file_path = os.path.join(Config.RAW_TEST_PATH, f)
        mfccs = extract_features(file_path)
        if mfccs is not None:
            mfccs = mfccs.reshape(1, Config.n_mfcc, Config.max_pad_len, 1)
            pred_prob = model.predict(mfccs, verbose=0)
            pred_class_idx = np.argmax(pred_prob, axis=1)[0]
            pred_class = le.inverse_transform([pred_class_idx])[0]
            confidence = np.max(pred_prob)
            results.append([f, pred_class, confidence])

    df = pd.DataFrame(results, columns=['filename', 'predicted_class', 'confidence'])
    df.to_csv(os.path.join(save_dir, 'test_predictions.csv'), index=False)
    print("预测完成，结果已保存")

# 主程序
if __name__ == "__main__":
    # 读取所有音频路径和标签
    all_files = []
    all_labels = []
    categories = [d for d in os.listdir(Config.RAW_TRAIN_PATH) if os.path.isdir(os.path.join(Config.RAW_TRAIN_PATH, d))]
    print(f"检测到类别: {categories}")

    for category in categories:
        cat_path = os.path.join(Config.RAW_TRAIN_PATH, category)
        files = [os.path.join(cat_path, f) for f in os.listdir(cat_path) if f.endswith('.wav')]
        all_files.extend(files)
        all_labels.extend([category] * len(files))

    # 数据集划分
    x_train_val_paths, x_test_paths, y_train_val_labels, y_test_labels = train_test_split(
        all_files, all_labels, test_size=0.2, random_state=42, stratify=all_labels)
    x_train_paths, x_val_paths, y_train_labels, y_val_labels = train_test_split(
        x_train_val_paths, y_train_val_labels, test_size=0.125, random_state=42, stratify=y_train_val_labels)

    print(f"数据集划分完成:")
    print(f"  训练集: {len(x_train_paths)}")
    print(f"  验证集: {len(x_val_paths)}")
    print(f"  测试集: {len(x_test_paths)}")

    # 批量提取特征
    def process_paths(paths):
        features, valid_idx = [], []
        for i, path in enumerate(paths):
            data = extract_features(path)
            if data is not None:
                features.append(data)
                valid_idx.append(i)
        return np.array(features), valid_idx

    print("\n提取训练集特征...")
    x_train, valid_idx_train = process_paths(x_train_paths)
    y_train_raw = np.array(y_train_labels)[valid_idx_train]

    print("提取验证集特征...")
    x_val, valid_idx_val = process_paths(x_val_paths)
    y_val_raw = np.array(y_val_labels)[valid_idx_val]

    print("提取测试集特征...")
    x_test, valid_idx_test = process_paths(x_test_paths)
    y_test_raw = np.array(y_test_labels)[valid_idx_test]

    # 标签编码
    le = LabelEncoder()
    le.fit(all_labels)
    num_labels = len(le.classes_)

    y_train = to_categorical(le.transform(y_train_raw), num_classes=num_labels)
    y_val = to_categorical(le.transform(y_val_raw), num_classes=num_labels)
    y_test = to_categorical(le.transform(y_test_raw), num_classes=num_labels)

    # 调整形状适配 CNN
    x_train = x_train.reshape(-1, Config.n_mfcc, Config.max_pad_len, 1)
    x_val = x_val.reshape(-1, Config.n_mfcc, Config.max_pad_len, 1)
    x_test = x_test.reshape(-1, Config.n_mfcc, Config.max_pad_len, 1)

    # 构建模型
    model = build_model(num_labels)

    # 训练回调
    checkpointer = ModelCheckpoint(Config.MODEL_SAVE_PATH, save_best_only=True, monitor='val_loss', verbose=1)
    early_stop = EarlyStopping(monitor='val_loss', patience=Config.patience_earlystop, restore_best_weights=True)

    # 开始训练
    print("\n开始训练...")
    history = model.fit(
        x_train, y_train,
        batch_size=Config.batch_size,
        epochs=Config.epochs,
        validation_data=(x_val, y_val),
        callbacks=[checkpointer, early_stop],
        verbose=1
    )

    # 保存信息
    with open(Config.HISTORY_PATH, 'wb') as f:
        pickle.dump(history.history, f)
    with open(Config.LABEL_ENCODER_PATH, 'wb') as f:
        pickle.dump(le, f)

    # 绘图与评估
    plot_history(history, Config.SAVE_DIR)
    best_model = load_model(Config.MODEL_SAVE_PATH)
    final_f1 = plot_advanced_evaluation(best_model, x_test, y_test, le, Config.SAVE_DIR)

    # 预测测试集
    predict_unlabeled_test(best_model, le, Config.SAVE_DIR)

    print(f"\n训练完成！最终 F1: {final_f1:.4f}")