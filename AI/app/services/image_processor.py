import cv2
import numpy as np
import os

def dewarp_cylinder(image_path: str) -> str:
    """
    원통형 라벨 평탄화 (Cylindrical Dewarping) 알고리즘
    이미지 너비의 중심(cx)을 기준으로 휘어진 좌표(theta)를 계산하고, 
    cv2.remap을 통해 평탄화된 평면 좌표계로 언래핑(Unwrapping)합니다.
    """
    img = cv2.imread(image_path)
    if img is None:
        return image_path
        
    h, w = img.shape[:2]
    
    # f: 곡률 보정 파라미터 (값을 줄이면 곡률 보정이 더 강하게 들어감)
    # 병 크기에 딱 맞게 크롭되었다면 w/2에 가깝지만, 여백이 있으면 w/1.5 수준이 무난함.
    f = w / 1.5  
    
    # 1. 대상(Destination) 평면의 각 (y, x) 픽셀 좌표 생성
    y_coords, x_coords = np.indices((h, w), dtype=np.float32)
    
    cx = w / 2.0
    cy = h / 2.0
    
    # 2. 중심 좌표를 원점으로 하여 회전 각도(theta) 도출
    theta = (x_coords - cx) / f
    
    # 3. 원본(Source - curved) 이미지에서 샘플링해 올 좌표 계산
    # X축: 좌우 가장자리로 갈수록 좁아진 간격을 원기둥 표면처럼 넓힘 (역투영)
    map_x = f * np.sin(theta) + cx
    
    # Y축: 가장자리로 갈수록 멀어져 압축되어 보이는 높이를 코사인 역보정으로 늘림
    map_y = (y_coords - cy) * np.cos(theta) + cy
    
    # 4. 리매핑 (넘파이 벡터화 연산으로 속도 최적화)
    unwarped = cv2.remap(
        img, 
        map_x, 
        map_y, 
        interpolation=cv2.INTER_LINEAR,
        borderMode=cv2.BORDER_REPLICATE
    )
    
    # 결과 저장용 임시 경로
    out_path = f"{image_path}_dewarped.jpg"
    cv2.imwrite(out_path, unwarped)
    
    return out_path
