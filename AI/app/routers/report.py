from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.core.deps import get_db
from app.services.report_service import build_report

router = APIRouter()

REPORT_REQUEST_EXAMPLE = {
  "user_id": 1,
  "gender": "MALE",
  "birth_date": "1995-05-15",
  "supplements": [
    {
      "user_supplement_id": 10,
      "alias": "종합비타민",
      "daily_dose": 1,
      "ingredients": [
        {
          "ingredient_id": 6,
          "ingredient_name": "비타민C",
          "amount": 500,
          "unit": "mg"
        },
        {
          "ingredient_id": 3,
          "ingredient_name": "비타민D",
          "amount": 25,
          "unit": "μg"
        },
        {
          "ingredient_id": 18,
          "ingredient_name": "칼슘",
          "amount": 300,
          "unit": "mg"
        }
      ]
    },
    {
      "user_supplement_id": 11,
      "alias": "오메가3",
      "daily_dose": 2,
      "ingredients": [
        {
          "ingredient_id": 38,
          "ingredient_name": "EPA와DHA의합",
          "amount": 900,
          "unit": "mg"
        }
      ]
    }
  ]
}



@router.post("/generate")
async def generate_report(
    req: dict = Body(..., example=REPORT_REQUEST_EXAMPLE),
    db: Session = Depends(get_db),
):
    # 필수 필드 검증
    required_fields = ["user_id", "gender", "birth_date", "supplements"]
    for field in required_fields:
        if field not in req:
            raise HTTPException(status_code=400, detail=f"'{field}' 필드가 필요합니다.")

    if "supplements" not in req:
        req["supplements"] = []

    try:
        result = build_report(req, db)
        return {
            "success": True,
            "message": "레포트 생성이 완료되었습니다.",
            "data": result,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"레포트 생성 중 오류 발생: {str(e)}")