from fastapi import FastAPI, HTTPException
import numpy as np
from pydantic import BaseModel
import uvicorn

from detect import detect_cry, detect_sleep

app = FastAPI(title="婴儿智能监测系统")

# 睡眠分期
class SleepRequest(BaseModel):
    data: list

@app.post("/api/sleep-stage")
def api_sleep(request: SleepRequest):
    try:
        arr = np.array(request.data, dtype=np.float32)
        stage, conf = detect_sleep(arr)
        return {
            "code": 0,
            "msg": "success",
            "stage": stage,
            "confidence": conf
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 哭声检测
class CryRequest(BaseModel):
    audio_data: list
    sr: int = 22050

@app.post("/api/baby-cry")
def api_cry(request: CryRequest):
    try:
        audio = np.array(request.audio_data, dtype=np.float32)
        label, conf = detect_cry(audio, request.sr)
        return {
            "code": 0,
            "msg": "success",
            "label": label,
            "confidence": conf
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8888)