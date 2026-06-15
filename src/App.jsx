import { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";
import { supabase } from "./supabaseClient";

const initialProfile = {
  nickname: "",
  age: "",
  height: "",
  sex: "male",
};

function createExerciseEntry(bodyPart = "legs") {
  return {
    id: crypto.randomUUID(),
    bodyPart,
    exercise: exerciseOptions[bodyPart][0],
    exerciseWeight: "0",
    sets: "3",
    reps: "10",
    cardioDuration: "30",
  };
}

const workoutTypeLabels = {
  weight: "웨이트",
  cardio: "유산소",
  hiit: "HIIT",
  mobility: "스트레칭",
};

const bodyPartLabels = {
  legs: "하체",
  chest: "가슴",
  back: "등",
  shoulders: "어깨",
  arms: "팔",
  core: "복근",
  fullBody: "전신",
  cardio: "유산소",
};

const exerciseOptions = {
  legs: [
    "바벨 백 스쿼트",
    "프론트 스쿼트",
    "레그 프레스",
    "불가리안 스플릿 스쿼트",
    "덤벨 런지",
    "워킹 런지",
    "레그 익스텐션",
    "라잉 레그 컬",
    "시티드 레그 컬",
    "루마니안 데드리프트",
    "힙 쓰러스트",
    "글루트 브릿지",
    "스탠딩 카프 레이즈",
    "시티드 카프 레이즈",
    "핵 스쿼트",
  ],
  chest: [
    "바벨 벤치프레스",
    "덤벨 벤치프레스",
    "인클라인 바벨 벤치프레스",
    "인클라인 덤벨 프레스",
    "디클라인 벤치프레스",
    "체스트 프레스 머신",
    "푸쉬업",
    "딥스",
    "덤벨 플라이",
    "케이블 플라이",
    "펙덱 플라이",
    "스미스머신 벤치프레스",
    "클로즈그립 벤치프레스",
    "인클라인 케이블 플라이",
    "덤벨 풀오버",
  ],
  back: [
    "데드리프트",
    "랫풀다운",
    "풀업",
    "친업",
    "바벨 로우",
    "덤벨 원암 로우",
    "시티드 케이블 로우",
    "티바 로우",
    "체스트 서포티드 로우",
    "머신 로우",
    "스트레이트 암 풀다운",
    "페이스풀",
    "백 익스텐션",
    "랙풀",
    "케이블 풀오버",
  ],
  shoulders: [
    "사이드 레터럴 레이즈",
    "덤벨 숄더프레스",
    "바벨 숄더프레스",
    "스미스머신 숄더프레스",
    "아놀드 프레스",
    "밀리터리 프레스",
    "머신 숄더프레스",
    "케이블 사이드 레터럴 레이즈",
    "프론트 레이즈",
    "리어 델트 플라이",
    "리버스 펙덱 플라이",
    "벤트오버 레터럴 레이즈",
    "페이스풀",
    "덤벨 업라이트 로우",
    "랜드마인 프레스",
  ],
  arms: [
    "바벨 컬",
    "덤벨 컬",
    "해머 컬",
    "인클라인 덤벨 컬",
    "프리처 컬",
    "케이블 컬",
    "컨센트레이션 컬",
    "트라이셉스 푸쉬다운",
    "오버헤드 트라이셉스 익스텐션",
    "라잉 트라이셉스 익스텐션",
    "스컬 크러셔",
    "클로즈그립 벤치프레스",
    "벤치 딥스",
    "케이블 로프 익스텐션",
    "덤벨 킥백",
  ],
  core: [
    "크런치",
    "리버스 크런치",
    "레그 레이즈",
    "행잉 레그 레이즈",
    "플랭크",
    "사이드 플랭크",
    "케이블 크런치",
    "러시안 트위스트",
    "바이시클 크런치",
    "마운틴 클라이머",
    "데드버그",
    "팔로프 프레스",
    "AB 롤아웃",
    "싯업",
    "토즈 투 바",
  ],
  fullBody: [
    "버피",
    "케틀벨 스윙",
    "스러스터",
    "클린 앤 프레스",
    "파워 클린",
    "스내치",
    "데빌 프레스",
    "터키시 겟업",
    "배틀로프",
    "슬레드 푸쉬",
    "파머스 워크",
    "월볼 샷",
    "덤벨 복합운동",
    "바벨 컴플렉스",
    "로잉머신 인터벌",
  ],
  cardio: [
    "런닝머신 걷기",
    "런닝머신 조깅",
    "런닝머신 인터벌",
    "천국의 계단",
    "실내 자전거",
    "스피닝 바이크",
    "일립티컬",
    "로잉머신",
    "스텝퍼",
    "싸이클 에르고미터",
  ],
};

const sexLabels = {
  male: "남성",
  female: "여성",
  other: "선택 안 함",
};

const exerciseWeightOptions = Array.from({ length: 301 }, (_, index) => String(index));
const setOptions = Array.from({ length: 20 }, (_, index) => String(index + 1));
const repOptions = Array.from({ length: 50 }, (_, index) => String(index + 1));

const cardioMetValues = {
  "런닝머신 걷기": 3.8,
  "런닝머신 조깅": 7,
  "런닝머신 인터벌": 10,
  "천국의 계단": 9,
  "실내 자전거": 6,
  "스피닝 바이크": 8.5,
  "일립티컬": 5.5,
  "로잉머신": 7,
  "스텝퍼": 7.5,
  "싸이클 에르고미터": 6.8,
};

const initialWorkout = {
  weight: "",
  goal: "muscle",
  exercises: [createExerciseEntry()],
  workoutType: "weight",
  duration: "60",
  intensity: "medium",
  fatigue: "medium",
};

const recipeStyles = [
  {
    suffix: "닭가슴살 간장덮밥",
    protein: "닭가슴살 120g",
    carb: "현미밥 120g",
    sauce: "간장 1큰술, 맛술 1큰술, 물 2큰술, 다진 마늘 0.5티스푼, 올리고당 0.5티스푼",
    steps:
      "팬에 소스를 먼저 넣고 약불에서 30초 끓인 뒤 닭가슴살과 작물을 넣어 3분 볶습니다. 밥 위에 올리고 대파 5g이나 깨 1티스푼을 뿌리면 운동 후 한 그릇 식사로 먹기 좋습니다.",
    nutrition: { protein: 39, carbs: 50, fat: 7, calories: 420 },
  },
  {
    suffix: "두부 된장볶음",
    protein: "단단한 두부 150g",
    carb: "잡곡밥 90g",
    sauce: "된장 0.5큰술, 물 2큰술, 다진 마늘 0.5티스푼, 참기름 0.5티스푼",
    steps:
      "두부는 키친타월로 물기를 빼고 큼직하게 썹니다. 팬에 소스를 넣고 두부와 작물을 함께 4분 볶은 뒤 밥을 곁들이면 담백하지만 요리다운 한 끼가 됩니다.",
    nutrition: { protein: 24, carbs: 36, fat: 13, calories: 365 },
  },
  {
    suffix: "달걀 오믈렛",
    protein: "달걀 2개와 흰자 1개",
    carb: "통밀빵 1장 45g",
    sauce: "우유 2큰술, 올리브오일 1티스푼, 소금 한 꼬집, 후추 약간",
    steps:
      "달걀, 흰자, 우유를 섞고 팬에 작물을 1분 먼저 볶습니다. 달걀물을 붓고 가장자리가 익으면 반으로 접어 1분 더 익힌 뒤 통밀빵과 함께 먹습니다.",
    nutrition: { protein: 25, carbs: 31, fat: 18, calories: 385 },
  },
  {
    suffix: "오트 팬케이크",
    protein: "무가당 그릭요거트 120g과 달걀 1개",
    carb: "오트밀 45g",
    sauce: "꿀 1티스푼, 베이킹파우더 0.5티스푼, 시나몬 약간",
    steps:
      "오트밀, 달걀, 그릭요거트, 베이킹파우더를 섞어 반죽을 만들고 작물을 넣습니다. 약불 팬에 한 국자씩 올려 앞뒤로 2분씩 구운 뒤 꿀을 얇게 뿌립니다.",
    nutrition: { protein: 25, carbs: 52, fat: 10, calories: 405 },
  },
  {
    suffix: "참치 김치볶음밥",
    protein: "기름 뺀 참치 100g",
    carb: "잡곡밥 120g",
    sauce: "잘게 썬 김치 60g, 간장 0.5티스푼, 고춧가루 0.5티스푼, 참기름 0.5티스푼",
    steps:
      "팬에 김치를 1분 볶고 참치와 작물을 넣어 2분 더 볶습니다. 밥을 넣고 고슬고슬하게 섞은 뒤 마지막에 참기름을 넣으면 간단한 볶음밥이 됩니다.",
    nutrition: { protein: 31, carbs: 48, fat: 8, calories: 395 },
  },
  {
    suffix: "크림 리조또",
    protein: "닭가슴살 90g과 저지방 우유 150ml",
    carb: "밥 110g",
    sauce: "파마산 치즈 1큰술, 다진 마늘 0.5티스푼, 소금 한 꼬집, 후추 약간",
    steps:
      "작물과 닭가슴살을 팬에 2분 볶고 우유와 밥을 넣어 중약불에서 4분 저어줍니다. 농도가 걸쭉해지면 치즈와 후추를 넣어 마무리합니다.",
    nutrition: { protein: 32, carbs: 45, fat: 11, calories: 410 },
  },
  {
    suffix: "소고기 굴소스볶음",
    protein: "우둔살 또는 홍두깨살 120g",
    carb: "찐 감자 120g",
    sauce: "굴소스 1티스푼, 간장 0.5티스푼, 다진 마늘 1티스푼, 올리브오일 1티스푼",
    steps:
      "팬에 올리브오일과 마늘을 넣고 고기를 먼저 센 불에서 2분 볶습니다. 작물과 소스를 넣고 2분 더 볶은 뒤 찐 감자를 곁들이면 든든한 메인 요리가 됩니다.",
    nutrition: { protein: 35, carbs: 38, fat: 13, calories: 410 },
  },
  {
    suffix: "또띠아 퀘사디아",
    protein: "닭가슴살 100g",
    carb: "통밀 또띠아 1장 55g",
    sauce: "모차렐라 치즈 25g, 그릭요거트 1큰술, 머스터드 0.5티스푼",
    steps:
      "또띠아 한쪽에 닭가슴살, 작물, 치즈를 올리고 반으로 접습니다. 마른 팬에서 앞뒤로 2분씩 눌러 구운 뒤 요거트 머스터드 소스를 찍어 먹습니다.",
    nutrition: { protein: 36, carbs: 38, fat: 13, calories: 420 },
  },
  {
    suffix: "새우 오일파스타",
    protein: "새우 120g",
    carb: "통밀 파스타면 삶은 것 120g",
    sauce: "올리브오일 1큰술, 다진 마늘 1티스푼, 페페론치노 약간, 소금 한 꼬집",
    steps:
      "팬에 올리브오일과 마늘을 넣고 향을 낸 뒤 새우와 작물을 2분 볶습니다. 삶은 파스타면과 면수 3큰술을 넣고 1분 더 볶아 촉촉하게 마무리합니다.",
    nutrition: { protein: 32, carbs: 47, fat: 14, calories: 445 },
  },
  {
    suffix: "따뜻한 단백질 스튜",
    protein: "닭가슴살 또는 두부 100g",
    carb: "삶은 고구마 100g",
    sauce: "물 350ml, 토마토소스 3큰술 또는 된장 0.5큰술, 다진 마늘 0.5티스푼",
    steps:
      "냄비에 물과 소스를 넣고 끓인 뒤 단백질 재료, 작물, 고구마를 넣습니다. 중불에서 7분 끓여 국물이 걸쭉해지면 후추를 뿌려 따뜻하게 먹습니다.",
    nutrition: { protein: 29, carbs: 38, fat: 7, calories: 340 },
  },
];

const cropRecipeDetails = {
  sweetPotato: { recipeAmount: "찐 고구마 200g", prep: "껍질을 벗기거나 깨끗이 씻어 한입 크기로 자른 고구마" },
  banana: { recipeAmount: "바나나 1개 120g", prep: "얇게 썬 바나나" },
  tomato: { recipeAmount: "토마토 2개 300g", prep: "먹기 좋게 큼직하게 썬 토마토" },
  spinach: { recipeAmount: "데친 시금치 150g", prep: "물기를 꼭 짠 데친 시금치" },
  broccoli: { recipeAmount: "데친 브로콜리 180g", prep: "2분 데쳐 한입 크기로 나눈 브로콜리" },
  blueberry: { recipeAmount: "블루베리 130g", prep: "씻어서 물기를 제거한 블루베리" },
  paprika: { recipeAmount: "파프리카 1개 150g", prep: "씨를 빼고 채 썬 파프리카" },
  cucumber: { recipeAmount: "오이 1개 180g", prep: "채 썰거나 반달 모양으로 썬 오이" },
  lettuce: { recipeAmount: "상추 12장 90g", prep: "씻어서 물기를 턴 상추" },
  strawberry: { recipeAmount: "딸기 200g", prep: "꼭지를 제거하고 반으로 자른 딸기" },
  carrot: { recipeAmount: "당근 120g", prep: "얇게 채 썰거나 살짝 데친 당근" },
  cabbage: { recipeAmount: "양배추 180g", prep: "가늘게 채 썬 양배추" },
  avocado: { recipeAmount: "아보카도 0.5개 80g", prep: "깍둑썰기한 아보카도" },
  kiwi: { recipeAmount: "키위 2개 160g", prep: "껍질을 벗겨 슬라이스한 키위" },
  apple: { recipeAmount: "사과 1개 180g", prep: "껍질째 얇게 썬 사과" },
  grape: { recipeAmount: "포도 150g", prep: "깨끗이 씻은 포도알" },
  pumpkin: { recipeAmount: "찐 단호박 180g", prep: "찐 뒤 껍질째 한입 크기로 자른 단호박" },
  mushroom: { recipeAmount: "버섯 160g", prep: "새송이, 양송이, 표고를 먹기 좋게 썬 버섯" },
  asparagus: { recipeAmount: "아스파라거스 120g", prep: "밑동을 제거하고 4cm로 자른 아스파라거스" },
  onion: { recipeAmount: "양파 120g", prep: "얇게 채 썰어 찬물에 5분 담갔다 뺀 양파" },
};

function createRecipeOptions(cropKey, cropName) {
  const detail = cropRecipeDetails[cropKey];

  return recipeStyles.map((style, index) => ({
    name: `${cropName} ${style.suffix}`,
    steps: [
      `${detail.prep} ${detail.recipeAmount}을 준비합니다.`,
      `${style.protein}, ${style.carb}을 준비하고 소스는 ${style.sauce}로 맞춥니다.`,
      style.steps,
    ],
    nutrition: {
      protein: style.nutrition.protein + (index % 3),
      carbs: style.nutrition.carbs + (cropKey === "banana" || cropKey === "sweetPotato" || cropKey === "pumpkin" ? 8 : 0),
      fat: style.nutrition.fat + (cropKey === "avocado" ? 8 : 0),
      calories:
        style.nutrition.calories +
        (cropKey === "banana" || cropKey === "sweetPotato" || cropKey === "pumpkin" ? 45 : 0) +
        (cropKey === "avocado" ? 75 : 0),
    },
  }));
}

const cropLibrary = {
  sweetPotato: {
    crop: "고구마",
    amount: "오늘 하루 권장량 180~250g",
    reason: "복합 탄수화물을 보충해 웨이트 후 떨어진 에너지를 채우기 좋습니다.",
    tag: "탄수화물 보충",
    recipe: {
      name: "고구마 닭가슴살 볼",
      steps: "찐 고구마 200g을 한입 크기로 자르고 닭가슴살 100g, 삶은 달걀 1개, 샐러드 채소 50g을 담습니다. 플레인 요거트 2큰술, 올리브오일 1티스푼, 후추 약간을 섞어 곁들입니다.",
      nutrition: { protein: 38, carbs: 48, fat: 12, calories: 450 },
    },
  },
  banana: {
    crop: "바나나",
    amount: "오늘 하루 권장량 1~2개",
    reason: "칼륨과 빠르게 쓰기 좋은 탄수화물이 있어 긴 운동 후 간단히 먹기 좋습니다.",
    tag: "칼륨",
    recipe: {
      name: "바나나 그릭요거트",
      steps: "바나나 1개를 썰고 그릭요거트 150g 위에 올립니다. 견과류 10g, 시리얼 20g, 꿀 1티스푼을 더하면 운동 후 간단한 탄수화물과 단백질 간식이 됩니다.",
      nutrition: { protein: 18, carbs: 56, fat: 9, calories: 365 },
    },
  },
  tomato: {
    crop: "토마토",
    amount: "오늘 하루 권장량 토마토 2개 또는 방울토마토 15개",
    reason: "수분과 칼륨 보충에 도움을 주고 땀을 많이 흘린 날 곁들이기 좋습니다.",
    tag: "수분 보충",
    recipe: {
      name: "토마토 달걀 스크램블",
      steps: "토마토 2개를 큼직하게 썰고 달걀 2개를 풀어둡니다. 팬에 올리브오일 1티스푼을 두르고 토마토를 1분 볶은 뒤 달걀을 넣어 익힙니다. 후추 약간과 통밀빵 1장 또는 밥 100g을 곁들입니다.",
      nutrition: { protein: 20, carbs: 35, fat: 18, calories: 385 },
    },
  },
  spinach: {
    crop: "시금치",
    amount: "오늘 하루 권장량 120~160g",
    reason: "마그네슘과 엽산을 포함해 하체나 전신 운동 후 식사 채소로 잘 맞습니다.",
    tag: "미네랄",
    recipe: {
      name: "시금치 두부무침",
      steps: "시금치 150g을 데쳐 물기를 짜고 두부 100g을 으깹니다. 참기름 1티스푼, 간장 1티스푼, 깨 1티스푼을 넣어 가볍게 무칩니다.",
      nutrition: { protein: 12, carbs: 10, fat: 11, calories: 185 },
    },
  },
  broccoli: {
    crop: "브로콜리",
    amount: "오늘 하루 권장량 150~200g",
    reason: "식이섬유와 항산화 성분이 풍부해 근성장 식단의 채소로 안정적입니다.",
    tag: "항산화",
    recipe: {
      name: "브로콜리 닭가슴살 볶음",
      steps: "브로콜리 180g을 2분 데치고 닭가슴살 120g을 먹기 좋게 자릅니다. 팬에 올리브오일 1티스푼, 다진 마늘 1티스푼을 넣고 함께 볶은 뒤 후추 약간을 뿌립니다.",
      nutrition: { protein: 38, carbs: 15, fat: 8, calories: 285 },
    },
  },
  blueberry: {
    crop: "블루베리",
    amount: "오늘 하루 권장량 120~150g",
    reason: "항산화 성분이 풍부해 고강도 운동 후 간식으로 활용하기 좋습니다.",
    tag: "회복 간식",
    recipe: {
      name: "블루베리 오트밀",
      steps: "오트밀 50g에 우유 또는 두유 180ml를 붓고 전자레인지에 1분 30초 데웁니다. 블루베리 130g, 그릭요거트 80g, 꿀 1티스푼을 올립니다.",
      nutrition: { protein: 17, carbs: 70, fat: 9, calories: 425 },
    },
  },
  paprika: {
    crop: "파프리카",
    amount: "오늘 하루 권장량 1~2개",
    reason: "비타민 C가 풍부해 단백질 식사와 같이 먹기 좋습니다.",
    tag: "비타민 C",
    recipe: {
      name: "파프리카 참치 샐러드",
      steps: "파프리카 1개를 채 썰고 기름 뺀 참치 100g, 양상추 50g, 옥수수 30g을 섞습니다. 레몬즙 1큰술, 플레인 요거트 2큰술, 후추 약간을 드레싱으로 사용합니다.",
      nutrition: { protein: 29, carbs: 22, fat: 5, calories: 250 },
    },
  },
  cucumber: {
    crop: "오이",
    amount: "오늘 하루 권장량 1~2개",
    reason: "수분 함량이 높아 유산소나 긴 운동 후 가볍게 보충하기 좋습니다.",
    tag: "저열량 수분",
    recipe: {
      name: "오이 닭가슴살 냉채",
      steps: "오이 1개를 채 썰고 닭가슴살 100g을 찢어 넣습니다. 식초 1큰술, 간장 1티스푼, 연겨자 0.5티스푼, 알룰로스나 꿀 0.5티스푼을 섞어 무칩니다.",
      nutrition: { protein: 31, carbs: 10, fat: 4, calories: 205 },
    },
  },
  lettuce: {
    crop: "상추",
    amount: "오늘 하루 권장량 10~15장",
    reason: "열량 부담이 낮고 포만감을 줘 체지방 감량 식단에 곁들이기 좋습니다.",
    tag: "식단 볼륨",
    recipe: {
      name: "상추 닭가슴살 쌈",
      steps: "상추 12장에 닭가슴살 120g, 현미밥 100g, 오이채 50g을 나눠 올립니다. 간장 1티스푼, 식초 1티스푼, 참기름 0.5티스푼을 섞어 소스로 사용합니다.",
      nutrition: { protein: 38, carbs: 34, fat: 8, calories: 360 },
    },
  },
  strawberry: {
    crop: "딸기",
    amount: "오늘 하루 권장량 180~220g",
    reason: "상큼하게 먹기 쉽고 비타민 C를 보충하기 좋은 과일입니다.",
    tag: "가벼운 과일",
    recipe: {
      name: "딸기 프로틴 스무디",
      steps: "딸기 200g, 우유 또는 두유 180ml, 플레인 요거트 80g을 믹서에 넣습니다. 단백질 파우더를 쓰는 사람은 15g 정도 더하고 얼음 4~5개와 함께 갈아 마십니다.",
      nutrition: { protein: 26, carbs: 35, fat: 6, calories: 300 },
    },
  },
  carrot: {
    crop: "당근",
    amount: "오늘 하루 권장량 100~150g",
    reason: "베타카로틴과 식이섬유가 있어 운동 후 식사에 색감과 포만감을 더하기 좋습니다.",
    tag: "베타카로틴",
  },
  cabbage: {
    crop: "양배추",
    amount: "오늘 하루 권장량 150~200g",
    reason: "열량 부담이 낮고 포만감이 좋아 감량기 식단의 채소 베이스로 쓰기 좋습니다.",
    tag: "포만감",
  },
  avocado: {
    crop: "아보카도",
    amount: "오늘 하루 권장량 0.5~1개",
    reason: "불포화지방과 칼륨을 함께 보충할 수 있어 고강도 운동 후 든든한 식사에 잘 맞습니다.",
    tag: "건강한 지방",
  },
  kiwi: {
    crop: "키위",
    amount: "오늘 하루 권장량 1~2개",
    reason: "비타민 C와 산뜻한 단맛이 있어 운동 후 입맛이 없을 때 과일 선택지로 좋습니다.",
    tag: "비타민 C",
  },
  apple: {
    crop: "사과",
    amount: "오늘 하루 권장량 0.5~1개",
    reason: "식이섬유와 탄수화물을 가볍게 보충할 수 있어 운동 후 간식으로 활용하기 좋습니다.",
    tag: "가벼운 탄수화물",
  },
  grape: {
    crop: "포도",
    amount: "오늘 하루 권장량 120~180g",
    reason: "빠르게 먹기 쉬운 당질과 수분이 있어 긴 운동 후 간단한 회복 간식으로 좋습니다.",
    tag: "빠른 에너지",
  },
  pumpkin: {
    crop: "단호박",
    amount: "오늘 하루 권장량 150~220g",
    reason: "복합 탄수화물과 부드러운 식감이 있어 하체나 전신 운동 후 식사 탄수화물로 좋습니다.",
    tag: "복합 탄수화물",
  },
  mushroom: {
    crop: "버섯",
    amount: "오늘 하루 권장량 120~180g",
    reason: "열량은 낮고 감칠맛과 식감이 좋아 단백질 식단을 물리지 않게 만들어줍니다.",
    tag: "저열량 식감",
  },
  asparagus: {
    crop: "아스파라거스",
    amount: "오늘 하루 권장량 100~150g",
    reason: "식이섬유와 미네랄을 더하기 좋아 웨이트 후 깔끔한 한 끼 채소로 잘 맞습니다.",
    tag: "미네랄 채소",
  },
  onion: {
    crop: "양파",
    amount: "오늘 하루 권장량 80~130g",
    reason: "단맛과 향이 있어 단백질 식사의 만족감을 올리고 볶음, 샐러드, 랩에 두루 쓰기 좋습니다.",
    tag: "식사 만족감",
  },
};

const cropVisuals = {
  sweetPotato: { icon: "🍠", tone: "root" },
  banana: { icon: "🍌", tone: "yellow" },
  tomato: { icon: "🍅", tone: "red" },
  spinach: { icon: "🥬", tone: "green" },
  broccoli: { icon: "🥦", tone: "green" },
  blueberry: { icon: "🫐", tone: "blue" },
  paprika: { icon: "🫑", tone: "green" },
  cucumber: { icon: "🥒", tone: "green" },
  lettuce: { icon: "🥬", tone: "green" },
  strawberry: { icon: "🍓", tone: "red" },
  carrot: { icon: "🥕", tone: "root" },
  cabbage: { icon: "🥬", tone: "green" },
  avocado: { icon: "🥑", tone: "green" },
  kiwi: { icon: "🥝", tone: "green" },
  apple: { icon: "🍎", tone: "red" },
  grape: { icon: "🍇", tone: "blue" },
  pumpkin: { icon: "🎃", tone: "root" },
  mushroom: { icon: "🍄", tone: "root" },
  asparagus: { icon: "🌿", tone: "green" },
  onion: { icon: "🧅", tone: "root" },
};

Object.entries(cropVisuals).forEach(([cropKey, visual]) => {
  cropLibrary[cropKey].visual = visual;
  cropLibrary[cropKey].recipes = createRecipeOptions(cropKey, cropLibrary[cropKey].crop);
});

function getWorkoutLoad(workout) {
  const duration = Number(workout.duration) || 0;
  const intensityScore = { low: 1, medium: 2, high: 3 }[workout.intensity];
  return duration * intensityScore;
}

function getStrengthMet(intensity) {
  return {
    low: 3.5,
    medium: 5,
    high: 6.5,
  }[intensity];
}

function calculateCaloriesForExercise(entry, workout, weightKg, strengthMinutes) {
  const isCardio = entry.bodyPart === "cardio";
  const minutes = isCardio ? toInteger(entry.cardioDuration) ?? 0 : strengthMinutes;
  const met = isCardio ? cardioMetValues[entry.exercise] ?? 6 : getStrengthMet(workout.intensity);
  const setCount = isCardio ? 1 : toInteger(entry.sets) ?? 1;
  const repCount = isCardio ? 1 : toInteger(entry.reps) ?? 1;
  const volumeMultiplier = isCardio
    ? 1
    : Math.min(1.35, Math.max(0.85, (setCount * repCount) / 30));

  return Math.round(((met * 3.5 * weightKg * minutes) / 200) * volumeMultiplier);
}

function calculateWorkoutCalories(workout) {
  const weightKg = toInteger(workout.weight) ?? 0;

  if (weightKg <= 0) {
    return 0;
  }

  const strengthEntries = workout.exercises.filter((entry) => entry.bodyPart !== "cardio");
  const strengthMinutes =
    strengthEntries.length > 0 ? (toInteger(workout.duration) ?? 0) / strengthEntries.length : 0;

  return workout.exercises.reduce(
    (total, entry) =>
      total + calculateCaloriesForExercise(entry, workout, weightKg, strengthMinutes),
    0,
  );
}

function getIntensityLabel(intensity) {
  return {
    low: "낮은 강도",
    medium: "보통 강도",
    high: "높은 강도",
  }[intensity];
}

function getGoalLabel(goal) {
  return {
    muscle: "근성장",
    fatLoss: "체지방 감량",
    endurance: "체력 향상",
  }[goal];
}

function getWorkoutContext(workout) {
  const exerciseNames = workout.exercises.map((entry) => entry.exercise);
  const bodyPartNames = [
    ...new Set(workout.exercises.map((entry) => bodyPartLabels[entry.bodyPart])),
  ];
  const hasCardio = workout.exercises.some((entry) => entry.bodyPart === "cardio");
  const hasLegs = workout.exercises.some((entry) => entry.bodyPart === "legs");
  const hasFullBody = workout.exercises.some((entry) => entry.bodyPart === "fullBody");
  const hasUpperPullOrPush = workout.exercises.some((entry) =>
    ["chest", "back", "shoulders", "arms"].includes(entry.bodyPart),
  );
  const cardioMinutes = workout.exercises
    .filter((entry) => entry.bodyPart === "cardio")
    .reduce((total, entry) => total + (toInteger(entry.cardioDuration) ?? 0), 0);

  return {
    bodyPartText: bodyPartNames.join(", "),
    exerciseText: exerciseNames.slice(0, 3).join(", "),
    goalText: getGoalLabel(workout.goal),
    intensityText: getIntensityLabel(workout.intensity),
    hasCardio,
    hasLegs,
    hasFullBody,
    hasUpperPullOrPush,
    cardioMinutes,
    load: getWorkoutLoad(workout),
  };
}

function buildDetailedReason(item, workout) {
  const context = getWorkoutContext(workout);
  const burnedCalories = calculateWorkoutCalories(workout);
  const amountText = item.amount.replace("오늘 하루 권장량 ", "");
  const workoutTarget = context.hasCardio
    ? `${context.bodyPartText} 운동과 유산소 ${context.cardioMinutes}분`
    : `${context.bodyPartText} 중심의 ${context.exerciseText}`;
  const fatigueText =
    workout.fatigue === "high" ? "피로도가 높은 편이라" : "운동 후 회복 흐름을 만들기 위해";

  const cropBenefits = {
    고구마: "복합 탄수화물로 근육 글리코겐 재충전을 돕고 포만감을 안정적으로 유지할 수 있습니다.",
    바나나: "칼륨과 빠르게 쓰이는 탄수화물을 보충해 근수축 후 피로감 관리에 도움이 됩니다.",
    토마토: "수분과 칼륨을 함께 보충해 땀 배출 후 전해질 균형을 잡는 데 유리합니다.",
    시금치: "마그네슘과 엽산을 더해 큰 근육을 사용한 뒤 근육 기능 유지에 도움을 줄 수 있습니다.",
    브로콜리: "식이섬유와 항산화 성분을 더해 단백질 식사의 회복 균형을 높일 수 있습니다.",
    블루베리: "폴리페놀 계열 항산화 성분으로 고강도 운동 후 산화 스트레스 관리에 도움이 됩니다.",
    파프리카: "비타민 C와 수분감을 더해 단백질 위주 식사의 영양 밀도를 높일 수 있습니다.",
    오이: "낮은 열량으로 수분과 식사 볼륨을 채워 감량기 포만감 관리에 유리합니다.",
    상추: "낮은 칼로리로 식사량을 늘려 체지방 감량 목표의 포만감 유지에 도움이 됩니다.",
    딸기: "비타민 C와 산뜻한 당질을 더해 운동 후 입맛 회복과 가벼운 탄수화물 보충에 좋습니다.",
    당근: "베타카로틴과 식이섬유를 더해 단백질 식사의 포만감과 미세영양소 균형을 보완합니다.",
    양배추: "낮은 열량과 높은 식사 볼륨으로 과식 방지와 포만감 관리에 도움을 줄 수 있습니다.",
    아보카도: "불포화지방과 칼륨을 보충해 고강도 운동 후 든든한 회복식 구성에 좋습니다.",
    키위: "비타민 C와 산뜻한 산미로 피로도가 있는 날 단백질 식사의 흡수 부담을 낮춰줍니다.",
    사과: "식이섬유와 가벼운 탄수화물을 더해 운동 후 간식 에너지 보충에 활용하기 좋습니다.",
    포도: "수분과 빠른 당질을 제공해 긴 운동 후 즉각적인 에너지 보충에 유리합니다.",
    단호박: "복합 탄수화물과 부드러운 식감으로 하체·전신 운동 후 에너지 회복에 잘 맞습니다.",
    버섯: "저열량 식감과 감칠맛을 더해 단백질 식사를 꾸준히 먹기 쉽게 만들어줍니다.",
    아스파라거스: "식이섬유와 미네랄을 더해 웨이트 후 깔끔한 회복식 채소로 활용하기 좋습니다.",
    양파: "단맛과 향을 더해 운동 후 단백질 식사의 만족감을 높이고 식단 지속성을 도와줍니다.",
  };

  return `${workoutTarget}을 ${context.intensityText}로 진행해 ${formatBurnedCalories(
    burnedCalories,
  )}를 소비했습니다. ${fatigueText} ${item.crop} ${amountText}을 섭취하면 ${
    cropBenefits[item.crop] ?? item.reason
  }`;
}

function getCropDecisionPoint(item, workout) {
  const context = getWorkoutContext(workout);
  const decisionPoints = {
    고구마: {
      title: "탄수화물 회복형",
      detail: "하체·전신 운동 후 묵직하게 에너지를 채우고 싶을 때 선택하세요.",
    },
    바나나: {
      title: "빠른 에너지형",
      detail: "운동 직후 피로감이 크거나 간단히 먹고 회복을 시작하고 싶을 때 좋습니다.",
    },
    토마토: {
      title: "수분·전해질형",
      detail: "땀을 많이 흘렸거나 유산소를 포함한 날 수분감 있게 보충하기 좋습니다.",
    },
    시금치: {
      title: "미네랄 보강형",
      detail: "큰 근육을 많이 쓴 날 식사에 마그네슘과 엽산을 더하고 싶을 때 맞습니다.",
    },
    브로콜리: {
      title: "근성장 식단 균형형",
      detail: "닭가슴살·달걀 같은 단백질 식사에 채소 균형을 더하고 싶을 때 좋습니다.",
    },
    블루베리: {
      title: "고강도 회복형",
      detail: "강도가 높았거나 피로가 누적된 날 항산화 간식처럼 선택하기 좋습니다.",
    },
    파프리카: {
      title: "비타민 C 보강형",
      detail: "단백질 위주의 식사가 심심하거나 신선한 채소감을 더하고 싶을 때 좋습니다.",
    },
    오이: {
      title: "저열량 수분형",
      detail: "다이어트 중 허기와 갈증을 함께 줄이고 싶을 때 부담 없이 선택하세요.",
    },
    상추: {
      title: "포만감 조절형",
      detail: "식사량은 유지하되 칼로리 부담을 낮추고 싶은 날 잘 맞습니다.",
    },
    딸기: {
      title: "가벼운 비타민형",
      detail: "운동 후 입맛이 없거나 달콤한 간식이 당길 때 가볍게 고르기 좋습니다.",
    },
    당근: {
      title: "식이섬유 보완형",
      detail: "식단이 단조로운 날 씹는 맛과 미세영양소를 더하고 싶을 때 좋습니다.",
    },
    양배추: {
      title: "감량 볼륨형",
      detail: "배고픔이 큰 날 식사 부피를 늘려 과식을 막고 싶을 때 선택하세요.",
    },
    아보카도: {
      title: "든든한 지방형",
      detail: "운동량이 많고 오래 포만감을 유지하고 싶은 날 잘 맞습니다.",
    },
    키위: {
      title: "상큼한 회복형",
      detail: "피로감이 있거나 단백질 식사와 함께 산뜻한 과일이 필요할 때 좋습니다.",
    },
    사과: {
      title: "간식 에너지형",
      detail: "식사 사이 출출함을 줄이면서 가볍게 탄수화물을 채우고 싶을 때 맞습니다.",
    },
    포도: {
      title: "즉시 보충형",
      detail: "긴 운동 후 빠르게 당질과 수분을 채우고 싶을 때 선택하기 쉽습니다.",
    },
    단호박: {
      title: "부드러운 탄수화물형",
      detail: "고구마보다 부드러운 탄수화물 식사를 원할 때 좋은 회복 선택지입니다.",
    },
    버섯: {
      title: "저열량 만족형",
      detail: "칼로리는 낮추고 식감과 감칠맛은 살리고 싶은 식사에 잘 맞습니다.",
    },
    아스파라거스: {
      title: "깔끔한 웨이트식형",
      detail: "상체 웨이트 후 담백한 단백질 메인과 곁들이기 좋은 선택입니다.",
    },
    양파: {
      title: "식단 지속형",
      detail: "운동식이 물릴 때 단맛과 향으로 식사 만족도를 높이고 싶을 때 좋습니다.",
    },
  };

  const basePoint = decisionPoints[item.crop] ?? {
    title: item.tag,
    detail: item.reason,
  };

  if (context.hasCardio && ["토마토", "오이", "포도", "키위"].includes(item.crop)) {
    return {
      ...basePoint,
      detail: `유산소 ${context.cardioMinutes}분 후 ${basePoint.detail}`,
    };
  }

  if (workout.fatigue === "high" && ["바나나", "블루베리", "딸기", "키위"].includes(item.crop)) {
    return {
      ...basePoint,
      detail: `피로도가 높은 날 ${basePoint.detail}`,
    };
  }

  return basePoint;
}

function getTodayKey() {
  return new Date().toLocaleDateString("sv-SE");
}

function hashString(value) {
  return [...value].reduce(
    (hash, char) => (Math.imul(31, hash) + char.charCodeAt(0)) | 0,
    7,
  );
}

function dailyRank(item, workout, index) {
  return Math.abs(
    hashString(
      `${getTodayKey()}-${item.crop}-${workout.goal}-${workout.intensity}-${workout.fatigue}-${index}`,
    ),
  );
}

function pickDailyRecipe(item, workout, index) {
  const recipes = item.recipes ?? [item.recipe];
  const recipeIndex = dailyRank(item, workout, index) % recipes.length;
  return recipes[recipeIndex];
}

function buildRecommendations(workout) {
  const picks = [];
  const add = (...items) => {
    items.forEach((item) => {
      if (!picks.some((picked) => picked.crop === item.crop)) {
        picks.push(item);
      }
    });
  };

  const load = getWorkoutLoad(workout);

  if (workout.goal === "muscle") {
    add(
      cropLibrary.sweetPotato,
      cropLibrary.broccoli,
      cropLibrary.paprika,
      cropLibrary.pumpkin,
      cropLibrary.mushroom,
      cropLibrary.avocado,
      cropLibrary.asparagus,
      cropLibrary.banana,
    );
  }

  if (workout.goal === "fatLoss") {
    add(
      cropLibrary.cucumber,
      cropLibrary.lettuce,
      cropLibrary.blueberry,
      cropLibrary.cabbage,
      cropLibrary.carrot,
      cropLibrary.mushroom,
      cropLibrary.tomato,
      cropLibrary.kiwi,
    );
  }

  if (workout.goal === "endurance") {
    add(
      cropLibrary.banana,
      cropLibrary.tomato,
      cropLibrary.spinach,
      cropLibrary.grape,
      cropLibrary.apple,
      cropLibrary.kiwi,
      cropLibrary.sweetPotato,
      cropLibrary.strawberry,
    );
  }

  const bodyParts = workout.exercises.map((entry) => entry.bodyPart);

  if (bodyParts.includes("legs") || bodyParts.includes("fullBody")) {
    add(cropLibrary.sweetPotato, cropLibrary.banana, cropLibrary.spinach, cropLibrary.pumpkin);
  }

  if (bodyParts.includes("chest") || bodyParts.includes("back")) {
    add(cropLibrary.broccoli, cropLibrary.paprika, cropLibrary.asparagus, cropLibrary.mushroom);
  }

  if (workout.workoutType === "cardio" || workout.workoutType === "hiit" || bodyParts.includes("cardio")) {
    add(cropLibrary.tomato, cropLibrary.cucumber, cropLibrary.blueberry, cropLibrary.grape, cropLibrary.kiwi);
  }

  if (load >= 180 || workout.fatigue === "high") {
    add(cropLibrary.banana, cropLibrary.sweetPotato, cropLibrary.strawberry, cropLibrary.apple, cropLibrary.avocado);
  }

  if (picks.length < 8) {
    add(...Object.values(cropLibrary));
  }

  return picks
    .map((item, index) => ({ item, rank: dailyRank(item, workout, index) }))
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 3)
    .map(({ item }, index) => ({
    ...item,
    decisionPoint: getCropDecisionPoint(item, workout),
    recipe: pickDailyRecipe(item, workout, index),
    reason: buildDetailedReason(item, workout),
  }));
}

function toInteger(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toWorkoutPayload(
  workout,
  profile,
  session,
  recommendations,
  workoutLoad,
  selectedRecommendation,
) {
  const firstExercise = workout.exercises[0];
  const weightKg = toInteger(workout.weight) ?? 0;
  const strengthEntries = workout.exercises.filter((entry) => entry.bodyPart !== "cardio");
  const strengthMinutes =
    strengthEntries.length > 0 ? (toInteger(workout.duration) ?? 0) / strengthEntries.length : 0;
  const exerciseDetails = workout.exercises.map((entry) => ({
    bodyPart: entry.bodyPart,
    bodyPartLabel: bodyPartLabels[entry.bodyPart],
    exercise: entry.exercise,
    exerciseWeight: entry.bodyPart === "cardio" ? null : toInteger(entry.exerciseWeight) ?? 0,
    sets: entry.bodyPart === "cardio" ? null : toInteger(entry.sets) ?? 1,
    reps: entry.bodyPart === "cardio" ? null : toInteger(entry.reps) ?? 1,
    cardioDuration:
      entry.bodyPart === "cardio" ? toInteger(entry.cardioDuration) ?? 0 : null,
    calories: calculateCaloriesForExercise(entry, workout, weightKg, strengthMinutes),
  }));
  const caloriesBurned = calculateWorkoutCalories(workout);

  return {
    user_id: session.user.id,
    age: toInteger(profile.age),
    height: toInteger(profile.height),
    weight: toInteger(workout.weight),
    sex: profile.sex,
    goal: workout.goal,
    body_part: firstExercise.bodyPart,
    exercise_name: firstExercise.exercise,
    exercise_weight:
      firstExercise.bodyPart === "cardio" ? 0 : toInteger(firstExercise.exerciseWeight) ?? 0,
    exercise_sets: firstExercise.bodyPart === "cardio" ? 0 : toInteger(firstExercise.sets) ?? 1,
    exercise_reps: firstExercise.bodyPart === "cardio" ? 0 : toInteger(firstExercise.reps) ?? 1,
    exercises: exerciseDetails,
    workout_type: workout.workoutType,
    duration: toInteger(workout.duration) ?? 0,
    intensity: workout.intensity,
    fatigue: workout.fatigue,
    workout_load: workoutLoad,
    calories_burned: caloriesBurned,
    selected_crop: selectedRecommendation.crop,
    selected_recipe: selectedRecommendation.recipe.name,
    selected_recipe_nutrition: selectedRecommendation.recipe.nutrition,
    recommendations,
  };
}

function getCurrentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function getMonthRange(month) {
  const [year, monthIndex] = month.split("-").map(Number);
  const start = new Date(year, monthIndex - 1, 1);
  const end = new Date(year, monthIndex, 1);

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

function formatBurnedCalories(value) {
  const calories = Number(value) || 0;
  return calories === 0 ? "0kcal" : `-${Math.abs(calories)}kcal`;
}

function formatLogExercises(log) {
  if (Array.isArray(log.exercises) && log.exercises.length > 0) {
    return log.exercises
      .map((entry) => {
        const bodyPartLabel = entry.bodyPartLabel ?? bodyPartLabels[entry.bodyPart] ?? entry.bodyPart;

        if (entry.bodyPart === "cardio") {
          return `${bodyPartLabel} / ${entry.exercise} / ${entry.cardioDuration ?? 0}분 / ${
            formatBurnedCalories(entry.calories)
          }`;
        }

        return `${bodyPartLabel} / ${entry.exercise} / ${entry.exerciseWeight ?? 0}kg / ${
          entry.sets ?? 1
        }세트 / ${entry.reps ?? 1}회`;
      })
      .join(", ");
  }

  if (log.body_part === "cardio") {
    return `${bodyPartLabels[log.body_part]} / ${log.exercise_name ?? "종목 미기록"} / ${
      log.duration
    }분`;
  }

  return `${bodyPartLabels[log.body_part] ?? log.body_part} / ${
    log.exercise_name ?? "종목 미기록"
  } / ${log.exercise_weight ?? 0}kg / ${log.exercise_sets ?? 1}세트 / ${
    log.exercise_reps ?? 1
  }회`;
}

function App() {
  const [session, setSession] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ email: "", password: "" });
  const [authMessage, setAuthMessage] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(true);
  const [profile, setProfile] = useState(initialProfile);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [workout, setWorkout] = useState(initialWorkout);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [recentLogs, setRecentLogs] = useState([]);
  const [monthlyLogs, setMonthlyLogs] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [dataMessage, setDataMessage] = useState("");
  const [dataError, setDataError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [openRecipeCrop, setOpenRecipeCrop] = useState("");
  const [showAllRecentLogs, setShowAllRecentLogs] = useState(false);
  const [showAllMonthlyLogs, setShowAllMonthlyLogs] = useState(false);

  const recommendations = useMemo(() => buildRecommendations(workout), [workout]);
  const workoutLoad = getWorkoutLoad(workout);
  const caloriesBurned = calculateWorkoutCalories(workout);
  const visibleRecentLogs = showAllRecentLogs ? recentLogs : recentLogs.slice(0, 5);
  const visibleMonthlyLogs = showAllMonthlyLogs ? monthlyLogs : monthlyLogs.slice(0, 5);
  const monthlyBurnedCalories = monthlyLogs.reduce(
    (total, log) => total + (log.calories_burned ?? 0),
    0,
  );
  const monthlyIntakeCalories = monthlyLogs.reduce(
    (total, log) => total + (log.selected_recipe_nutrition?.calories ?? 0),
    0,
  );
  const monthlyNetCalories = monthlyIntakeCalories - monthlyBurnedCalories;

  const loadRecentLogs = useCallback(async (currentSession) => {
    if (!currentSession) {
      setRecentLogs([]);
      return;
    }

    const { data, error } = await supabase
      .from("workout_logs")
      .select("*")
      .eq("user_id", currentSession.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      setDataError("운동 기록 테이블을 불러오지 못했습니다. Supabase SQL 설정을 확인해 주세요.");
      setRecentLogs([]);
      return;
    }

    setDataError("");
    setRecentLogs(data ?? []);
  }, []);

  const loadMonthlyLogs = useCallback(async (currentSession, month) => {
    if (!currentSession) {
      setMonthlyLogs([]);
      return;
    }

    const { start, end } = getMonthRange(month);
    const { data, error } = await supabase
      .from("workout_logs")
      .select("*")
      .eq("user_id", currentSession.user.id)
      .gte("created_at", start)
      .lt("created_at", end)
      .order("created_at", { ascending: false });

    if (error) {
      setDataError("월간 기록을 불러오지 못했습니다. Supabase SQL 설정을 확인해 주세요.");
      setMonthlyLogs([]);
      return;
    }

    setDataError("");
    setMonthlyLogs(data ?? []);
  }, []);

  useEffect(() => {
    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setAuthLoading(false);
    };

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchUserProfile = async () => {
      if (!session) {
        if (!isMounted) {
          return;
        }

        setProfile(initialProfile);
        setProfileSaved(false);
        setProfileLoaded(true);
        return;
      }

      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (!isMounted) {
        return;
      }

      if (error) {
        setProfileError("신체 프로필 테이블이 아직 준비되지 않았습니다. Supabase에서 프로필 SQL을 실행해 주세요.");
        setProfileSaved(false);
        setProfileLoaded(true);
        return;
      }

      if (data) {
      setProfile({
        nickname: data.nickname ?? "",
        age: String(data.age ?? ""),
        height: String(data.height ?? ""),
        sex: data.sex ?? "male",
      });
        setProfileSaved(true);
        setIsEditingProfile(false);
      } else {
        setProfile(initialProfile);
        setProfileSaved(false);
        setIsEditingProfile(true);
      }

      setProfileError("");
      setProfileLoaded(true);
    };

    fetchUserProfile();

    return () => {
      isMounted = false;
    };
  }, [session]);

  useEffect(() => {
    let isMounted = true;

    const fetchRecentLogs = async () => {
      if (!session) {
        return;
      }

      const { data, error } = await supabase
        .from("workout_logs")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (!isMounted) {
        return;
      }

      if (error) {
        setDataError("운동 기록 테이블을 불러오지 못했습니다. Supabase SQL 설정을 확인해 주세요.");
        setRecentLogs([]);
        return;
      }

      setDataError("");
      setRecentLogs(data ?? []);
    };

    fetchRecentLogs();

    return () => {
      isMounted = false;
    };
  }, [session]);

  useEffect(() => {
    let isMounted = true;

    const fetchMonthlyLogs = async () => {
      if (!session) {
        return;
      }

      const { start, end } = getMonthRange(selectedMonth);
      const { data, error } = await supabase
        .from("workout_logs")
        .select("*")
        .eq("user_id", session.user.id)
        .gte("created_at", start)
        .lt("created_at", end)
        .order("created_at", { ascending: false });

      if (!isMounted) {
        return;
      }

      if (error) {
        setDataError("월간 기록을 불러오지 못했습니다. Supabase SQL 설정을 확인해 주세요.");
        setMonthlyLogs([]);
        return;
      }

      setDataError("");
      setMonthlyLogs(data ?? []);
    };

    fetchMonthlyLogs();

    return () => {
      isMounted = false;
    };
  }, [selectedMonth, session]);

  const handleAuthChange = (event) => {
    const { name, value } = event.target;
    setAuthForm((current) => ({ ...current, [name]: value }));
  };

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfile((current) => ({ ...current, [name]: value }));
  };

  const handleWorkoutChange = (event) => {
    const { name, value } = event.target;
    setWorkout((current) => ({ ...current, [name]: value }));
  };

  const handleExerciseChange = (id, name, value) => {
    setWorkout((current) => ({
      ...current,
      exercises: current.exercises.map((entry) => {
        if (entry.id !== id) {
          return entry;
        }

        if (name === "bodyPart") {
          return {
            ...entry,
            bodyPart: value,
            exercise: exerciseOptions[value][0],
          };
        }

        return { ...entry, [name]: value };
      }),
    }));
  };

  const addExerciseEntry = () => {
    setWorkout((current) => ({
      ...current,
      exercises: [...current.exercises, createExerciseEntry()],
    }));
  };

  const removeExerciseEntry = (id) => {
    setWorkout((current) => {
      if (current.exercises.length === 1) {
        return current;
      }

      return {
        ...current,
        exercises: current.exercises.filter((entry) => entry.id !== id),
      };
    });
  };

  const toggleAuthMode = () => {
    setAuthMode((current) => (current === "login" ? "signup" : "login"));
    setAuthError("");
    setAuthMessage("");
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    setAuthMessage("");

    const credentials = {
      email: authForm.email,
      password: authForm.password,
    };

    const { data, error } =
      authMode === "login"
        ? await supabase.auth.signInWithPassword(credentials)
        : await supabase.auth.signUp(credentials);

    if (error) {
      setAuthError(error.message);
      setAuthLoading(false);
      return;
    }

    if (data.session) {
      setSession(data.session);
      setAuthMessage(authMode === "login" ? "로그인되었습니다." : "회원가입이 완료되었습니다.");
    } else {
      setAuthMessage("회원가입 확인 메일을 보냈습니다. 이메일 인증 후 로그인하세요.");
    }

    setAuthLoading(false);
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setProfileMessage("");
    setProfileError("");

    if (!session) {
      setProfileError("로그인 후 신체 프로필을 저장할 수 있습니다.");
      return;
    }

    const payload = {
      user_id: session.user.id,
      nickname: profile.nickname.trim(),
      age: toInteger(profile.age),
      height: toInteger(profile.height),
      sex: profile.sex,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("user_profiles").upsert(payload);

    if (error) {
      setProfileError("신체 프로필을 저장하지 못했습니다. Supabase에서 프로필 SQL을 실행했는지 확인해 주세요.");
      return;
    }

    setProfileSaved(true);
    setIsEditingProfile(false);
    setProfileMessage("신체 프로필을 저장했습니다.");
  };

  const handleAnalyze = (event) => {
    event.preventDefault();
    setHasAnalyzed(true);
    setDataMessage("");
    setDataError("");
    setOpenRecipeCrop("");

    if (!session) {
      setDataError("로그인 후 추천 결과를 저장할 수 있습니다.");
      return;
    }

    if (!profileSaved) {
      setDataError("추천 결과를 저장하려면 먼저 신체 프로필을 저장해 주세요.");
      setIsEditingProfile(true);
    }
  };

  const handleSelectRecipe = async (selectedRecommendation) => {
    setDataMessage("");
    setDataError("");

    if (!session) {
      setDataError("로그인 후 선택한 레시피를 저장할 수 있습니다.");
      return;
    }

    if (!profileSaved) {
      setDataError("저장하려면 먼저 신체 프로필을 저장해 주세요.");
      setIsEditingProfile(true);
      return;
    }

    setIsSaving(true);

    const payload = toWorkoutPayload(
      workout,
      profile,
      session,
      recommendations,
      workoutLoad,
      selectedRecommendation,
    );
    const { error } = await supabase.from("workout_logs").insert(payload);

    if (error) {
      setDataError("선택한 레시피를 저장하지 못했습니다. Supabase SQL 설정을 확인해 주세요.");
      setIsSaving(false);
      return;
    }

    setDataMessage(`${selectedRecommendation.crop} / ${selectedRecommendation.recipe.name}을 오늘 기록으로 저장했습니다.`);
    await loadRecentLogs(session);
    await loadMonthlyLogs(session, selectedMonth);
    setIsSaving(false);
  };

  const handleLogout = async () => {
    setAuthLoading(true);
    await supabase.auth.signOut();
    setSession(null);
    setAuthForm({ email: "", password: "" });
    setProfile(initialProfile);
    setProfileSaved(false);
    setProfileLoaded(false);
    setIsEditingProfile(false);
    setWorkout(initialWorkout);
    setHasAnalyzed(false);
    setOpenRecipeCrop("");
    setShowAllRecentLogs(false);
    setShowAllMonthlyLogs(false);
    setRecentLogs([]);
    setMonthlyLogs([]);
    setDataMessage("");
    setDataError("");
    setAuthLoading(false);
  };

  const userEmail = session?.user?.email ?? "";
  const userName = profile.nickname || userEmail.split("@")[0] || "사용자";

  if (authLoading && !session) {
    return (
      <main className="auth-page">
        <section className="auth-panel">
          <p className="eyebrow brand-mark">Muscle Crop</p>
          <h1>로그인 상태를 확인하고 있습니다</h1>
          <p className="intro">잠시만 기다려 주세요.</p>
        </section>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="auth-page">
        <aside className="auth-visual auth-visual-left">
          <img
            src="/images/park-jaehoon-sweet-potato.png"
            alt="고구마를 들고 있는 보디빌더 이미지"
          />
          <div>
            <span>Sweet Potato Power</span>
            <strong>
              <span>운동 후</span>
              <span>탄수화물</span>
              <span>충전</span>
            </strong>
          </div>
        </aside>

        <section className="auth-panel" aria-labelledby="auth-title">
          <h1 className="auth-title auth-slogan" id="auth-title">
            <span>Muscle Crop</span>
            <small>손 안의 영양사</small>
          </h1>
          <p className="intro">
            계정을 만들고 신체 프로필을 저장하면, 매일 운동 기록만 입력해서
            회복에 어울리는 과일과 채소를 추천받을 수 있습니다.
          </p>

          <div className="auth-tabs" aria-label="인증 방식 선택">
            <button
              className={authMode === "login" ? "active" : ""}
              type="button"
              onClick={() => setAuthMode("login")}
            >
              로그인
            </button>
            <button
              className={authMode === "signup" ? "active" : ""}
              type="button"
              onClick={() => setAuthMode("signup")}
            >
              회원가입
            </button>
          </div>

          <form className="auth-form" onSubmit={handleAuthSubmit}>
            <label>
              이메일
              <input
                type="email"
                name="email"
                placeholder="example@email.com"
                value={authForm.email}
                onChange={handleAuthChange}
                required
              />
            </label>

            <label>
              비밀번호
              <input
                type="password"
                name="password"
                minLength="6"
                placeholder="6자 이상 입력하세요"
                value={authForm.password}
                onChange={handleAuthChange}
                required
              />
            </label>

            {authError && <p className="auth-error">{authError}</p>}
            {authMessage && <p className="auth-success">{authMessage}</p>}

            <button type="submit" disabled={authLoading}>
              {authLoading
                ? "처리 중..."
                : authMode === "login"
                  ? "로그인"
                  : "회원가입"}
            </button>
          </form>

          <button className="link-button" type="button" onClick={toggleAuthMode}>
            {authMode === "login"
              ? "계정이 없나요? 회원가입하기"
              : "이미 계정이 있나요? 로그인하기"}
          </button>
        </section>

        <aside className="auth-visual auth-visual-right">
          <img
            src="/images/chris-bumstead-broccoli.png"
            alt="브로콜리를 들고 있는 보디빌더 이미지"
          />
          <div>
            <span>Broccoli Recovery</span>
            <strong>단백질 식단에 더하는 채소</strong>
          </div>
        </aside>
      </main>
    );
  }

  if (!profileLoaded) {
    return (
      <main className="auth-page">
        <section className="auth-panel">
          <p className="eyebrow brand-mark">Muscle Crop</p>
          <h1>신체 프로필을 불러오고 있습니다</h1>
          <p className="intro">잠시만 기다려 주세요.</p>
        </section>
      </main>
    );
  }

  if (!profileSaved || isEditingProfile) {
    return (
      <main className="auth-page">
        <section className="auth-panel" aria-labelledby="profile-title">
          <p className="eyebrow brand-mark">Muscle Crop</p>
          <h1 id="profile-title">신체 프로필 저장</h1>
          <p className="intro">
            닉네임과 기본 신체 정보를 저장하면 매일 운동 기록만 입력하면 됩니다.
          </p>

          <form className="auth-form" onSubmit={handleProfileSubmit}>
            <label>
              닉네임
              <input
                type="text"
                name="nickname"
                maxLength="16"
                placeholder="예: 헬스감자"
                value={profile.nickname}
                onChange={handleProfileChange}
                required
              />
            </label>

            <label>
              나이
              <input
                type="number"
                name="age"
                min="1"
                placeholder="예: 24"
                value={profile.age}
                onChange={handleProfileChange}
                required
              />
            </label>

            <label>
              키
              <input
                type="number"
                name="height"
                min="1"
                placeholder="예: 175"
                value={profile.height}
                onChange={handleProfileChange}
                required
              />
            </label>

            <label>
              성별
              <select name="sex" value={profile.sex} onChange={handleProfileChange}>
                <option value="male">남성</option>
                <option value="female">여성</option>
                <option value="other">선택 안 함</option>
              </select>
            </label>

            {profileError && <p className="auth-error">{profileError}</p>}
            {profileMessage && <p className="auth-success">{profileMessage}</p>}

            <button type="submit">신체 프로필 저장</button>
          </form>

          {profileSaved && (
            <button
              className="link-button"
              type="button"
              onClick={() => setIsEditingProfile(false)}
            >
              운동 기록으로 돌아가기
            </button>
          )}
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow app-kicker">Muscle Crop</p>
          <h1 className="dashboard-title">
            <span>{userName}님의</span>
            <strong>Personal Crop</strong>
          </h1>
        </div>
        <button className="secondary-button" type="button" onClick={handleLogout}>
          로그아웃
        </button>
      </header>

      <section className="daily-report" aria-label="오늘의 운동 영양 리포트">
        <div>
          <span>Today Nutrition Report</span>
          <strong>오늘의 운동 영양 리포트</strong>
        </div>
        <dl>
          <div>
            <dt>목표</dt>
            <dd>{getGoalLabel(workout.goal)}</dd>
          </div>
          <div>
            <dt>운동</dt>
            <dd>{workout.duration}분</dd>
          </div>
          <div>
            <dt>소비</dt>
            <dd>{formatBurnedCalories(caloriesBurned)}</dd>
          </div>
        </dl>
      </section>

      <section className="workspace">
        <div className="left-stack">
          <section className="profile-summary">
            <div className="section-heading">
              <span>00</span>
              <div>
                <h2>Athlete Profile</h2>
                <p>운동 기록에 자동으로 함께 저장되는 신체 정보입니다.</p>
              </div>
            </div>
            <div className="profile-chips">
              <span>{profile.nickname}</span>
              <span>{profile.age}세</span>
              <span>{profile.height}cm</span>
              <span>{sexLabels[profile.sex]}</span>
            </div>
            <button
              className="secondary-button full-button"
              type="button"
              onClick={() => setIsEditingProfile(true)}
            >
              신체 프로필 수정
            </button>
          </section>

          <form className="profile-panel" onSubmit={handleAnalyze}>
            <div className="section-heading">
              <span>01</span>
              <div>
                <h2>Workout Log</h2>
                <p>오늘 수행한 운동 볼륨과 강도를 기록하세요.</p>
              </div>
            </div>

            <div className="field-grid">
              <label>
                오늘 체중
                <input
                  type="number"
                  name="weight"
                  min="1"
                  placeholder="예: 72"
                  value={workout.weight}
                  onChange={handleWorkoutChange}
                  required
                />
              </label>

              <label>
                운동 목표
                <select name="goal" value={workout.goal} onChange={handleWorkoutChange}>
                  <option value="muscle">근성장</option>
                  <option value="fatLoss">체지방 감량</option>
                  <option value="endurance">체력 향상</option>
                </select>
              </label>

              <div className="exercise-builder">
                <div className="exercise-builder-header">
                  <div>
                    <h3>운동 종목</h3>
                    <p>오늘 수행한 부위와 종목을 여러 개 추가할 수 있습니다.</p>
                  </div>
                  <button type="button" onClick={addExerciseEntry}>
                    종목 추가
                  </button>
                </div>

                {workout.exercises.map((entry, index) => (
                  <div className="exercise-row" key={entry.id}>
                    <label>
                      운동 부위
                      <select
                        name="bodyPart"
                        value={entry.bodyPart}
                        onChange={(event) =>
                          handleExerciseChange(entry.id, "bodyPart", event.target.value)
                        }
                      >
                        <option value="legs">하체</option>
                        <option value="chest">가슴</option>
                        <option value="back">등</option>
                        <option value="shoulders">어깨</option>
                        <option value="arms">팔</option>
                        <option value="core">복근</option>
                        <option value="fullBody">전신</option>
                        <option value="cardio">유산소</option>
                      </select>
                    </label>

                    <label>
                      운동 종목
                      <select
                        name="exercise"
                        value={entry.exercise}
                        onChange={(event) =>
                          handleExerciseChange(entry.id, "exercise", event.target.value)
                        }
                      >
                        {exerciseOptions[entry.bodyPart].map((exercise) => (
                          <option value={exercise} key={exercise}>
                            {exercise}
                          </option>
                        ))}
                      </select>
                    </label>

                    {entry.bodyPart === "cardio" ? (
                      <label>
                        유산소 시간
                        <input
                          type="number"
                          name="cardioDuration"
                          min="1"
                          placeholder="분 단위"
                          value={entry.cardioDuration}
                          onChange={(event) =>
                            handleExerciseChange(
                              entry.id,
                              "cardioDuration",
                              event.target.value,
                            )
                          }
                          required
                        />
                      </label>
                    ) : (
                      <>
                        <label>
                          종목 무게
                          <select
                            name="exerciseWeight"
                            value={entry.exerciseWeight}
                            onChange={(event) =>
                              handleExerciseChange(
                                entry.id,
                                "exerciseWeight",
                                event.target.value,
                              )
                            }
                          >
                            {exerciseWeightOptions.map((weight) => (
                              <option value={weight} key={weight}>
                                {weight}kg
                              </option>
                            ))}
                          </select>
                        </label>

                        <label>
                          세트 수
                          <select
                            name="sets"
                            value={entry.sets}
                            onChange={(event) =>
                              handleExerciseChange(entry.id, "sets", event.target.value)
                            }
                          >
                            {setOptions.map((sets) => (
                              <option value={sets} key={sets}>
                                {sets}세트
                              </option>
                            ))}
                          </select>
                        </label>

                        <label>
                          세트당 횟수
                          <select
                            name="reps"
                            value={entry.reps}
                            onChange={(event) =>
                              handleExerciseChange(entry.id, "reps", event.target.value)
                            }
                          >
                            {repOptions.map((reps) => (
                              <option value={reps} key={reps}>
                                {reps}회
                              </option>
                            ))}
                          </select>
                        </label>
                      </>
                    )}

                    <button
                      className="remove-exercise-button"
                      type="button"
                      onClick={() => removeExerciseEntry(entry.id)}
                      disabled={workout.exercises.length === 1}
                    >
                      {index + 1} 삭제
                    </button>
                  </div>
                ))}
              </div>

              <label>
                운동 종류
                <select
                  name="workoutType"
                  value={workout.workoutType}
                  onChange={handleWorkoutChange}
                >
                  <option value="weight">웨이트</option>
                  <option value="cardio">유산소</option>
                  <option value="hiit">HIIT</option>
                  <option value="mobility">스트레칭/가동성</option>
                </select>
              </label>

              <label>
                운동 시간
                <input
                  type="number"
                  name="duration"
                  min="1"
                  placeholder="분 단위"
                  value={workout.duration}
                  onChange={handleWorkoutChange}
                  required
                />
              </label>

              <label>
                운동 강도
                <select
                  name="intensity"
                  value={workout.intensity}
                  onChange={handleWorkoutChange}
                >
                  <option value="low">낮음</option>
                  <option value="medium">보통</option>
                  <option value="high">높음</option>
                </select>
              </label>

              <label>
                운동 후 피로도
                <select
                  name="fatigue"
                  value={workout.fatigue}
                  onChange={handleWorkoutChange}
                >
                  <option value="low">가벼움</option>
                  <option value="medium">보통</option>
                  <option value="high">많이 피곤함</option>
                </select>
              </label>
            </div>

            <button type="submit" disabled={isSaving}>
              {isSaving ? "저장 중..." : "오늘의 섭취 추천 보기"}
            </button>
          </form>
        </div>

        <section className="result-panel" aria-live="polite">
          <div className="section-heading">
            <span>02</span>
            <div>
              <h2>Recovery Nutrition</h2>
              <p>오늘은 아래 3가지 중 한 가지만 골라 먹어도 충분합니다.</p>
            </div>
          </div>

          {!hasAnalyzed ? (
            <div className="empty-state">
              운동 기록을 입력한 뒤 오늘 먹기 좋은 원예작물을 확인하세요.
            </div>
          ) : (
            <>
              <div className="workout-summary">
                <div>
                  <span>운동 부하</span>
                  <strong>{workoutLoad}</strong>
                </div>
                <div>
                  <span>운동 시간</span>
                  <strong>{workout.duration}분</strong>
                </div>
                <div>
                  <span>추천 수</span>
                  <strong>{recommendations.length}개</strong>
                </div>
                <div>
                  <span>예상 소비 칼로리</span>
                  <strong>{formatBurnedCalories(caloriesBurned)}</strong>
                </div>
              </div>

              <div className="crop-list">
                {recommendations.map((item) => (
                  <article className="crop-card" key={item.crop}>
                    <div className="crop-card-header">
                      <div
                        className={`crop-visual crop-visual-${item.visual.tone}`}
                        aria-label={`${item.crop} 이미지`}
                        role="img"
                      >
                        {item.visual.icon}
                      </div>
                      <div>
                        <span className="recovery-badge">RECOVERY PICK</span>
                        <span className="tag">{item.tag}</span>
                        <h3>{item.crop}</h3>
                      </div>
                    </div>
                    <p className="amount">{item.amount}</p>
                    <div className="decision-point">
                      <span>오늘의 선택 기준</span>
                      <strong>{item.decisionPoint.title}</strong>
                      <p>{item.decisionPoint.detail}</p>
                    </div>
                    <p>{item.reason}</p>
                    <div className="nutrition-grid">
                      <div>
                        <span>단백질</span>
                        <strong>{item.recipe.nutrition.protein}g</strong>
                      </div>
                      <div>
                        <span>탄수화물</span>
                        <strong>{item.recipe.nutrition.carbs}g</strong>
                      </div>
                      <div>
                        <span>지방</span>
                        <strong>{item.recipe.nutrition.fat}g</strong>
                      </div>
                      <div>
                        <span>칼로리</span>
                        <strong>{item.recipe.nutrition.calories}kcal</strong>
                      </div>
                    </div>
                    <button
                      className="recipe-toggle"
                      type="button"
                      onClick={() =>
                        setOpenRecipeCrop((current) =>
                          current === item.crop ? "" : item.crop,
                        )
                      }
                    >
                      {openRecipeCrop === item.crop
                        ? "추천 레시피 닫기"
                        : "오늘의 추천 레시피 보기"}
                    </button>
                    {openRecipeCrop === item.crop && (
                      <div className="recipe-box">
                        <span>오늘의 추천 레시피</span>
                        <strong>{item.recipe.name}</strong>
                        {Array.isArray(item.recipe.steps) ? (
                          <ol className="recipe-steps">
                            {item.recipe.steps.map((step) => (
                              <li key={step}>{step}</li>
                            ))}
                          </ol>
                        ) : (
                          <p>{item.recipe.steps}</p>
                        )}
                      </div>
                    )}
                    <button
                      className="select-recipe-button"
                      type="button"
                      onClick={() => handleSelectRecipe(item)}
                      disabled={isSaving}
                    >
                      {isSaving ? "저장 중..." : "이 레시피 선택하고 월간 기록에 저장"}
                    </button>
                  </article>
                ))}
              </div>
            </>
          )}

          {isSaving && <p className="data-status">운동 기록을 저장하는 중입니다.</p>}
          {dataMessage && <p className="auth-success">{dataMessage}</p>}
          {dataError && <p className="auth-error">{dataError}</p>}

          <div className="history-panel">
            <h3>최근 저장 기록</h3>
            {recentLogs.length === 0 ? (
              <p>아직 저장된 운동 기록이 없습니다.</p>
            ) : (
              <div className="history-list">
                {visibleRecentLogs.map((log) => (
                  <article className="history-item" key={log.id}>
                    <div>
                      <strong>{log.workout_date}</strong>
                      <span>
                        {workoutTypeLabels[log.workout_type] ?? log.workout_type} /{" "}
                        {formatLogExercises(log)} / {log.duration}분
                      </span>
                      <span>
                        선택: {log.selected_crop ?? "없음"} ·{" "}
                        {log.selected_recipe ?? "레시피 미저장"}
                      </span>
                    </div>
                    <span className="history-load">
                      {formatBurnedCalories(log.calories_burned)}
                    </span>
                  </article>
                ))}
              </div>
            )}
            {recentLogs.length > 5 && (
              <button
                className="show-more-button"
                type="button"
                onClick={() => setShowAllRecentLogs((current) => !current)}
              >
                {showAllRecentLogs ? "최근 기록 접기" : `과거 기록 더보기 (${recentLogs.length - 5}개)`}
              </button>
            )}
          </div>

          <div className="monthly-panel">
            <div className="monthly-header">
              <div>
                <h3>월간 운동·레시피 기록</h3>
                <p>선택한 레시피의 영양값과 운동 소비 칼로리를 함께 정리합니다.</p>
              </div>
              <input
                aria-label="월 선택"
                type="month"
                value={selectedMonth}
                onChange={(event) => {
                  setSelectedMonth(event.target.value);
                  setShowAllMonthlyLogs(false);
                }}
              />
            </div>

            <div className="monthly-stats">
              <div>
                <span>저장된 운동일</span>
                <strong>{monthlyLogs.length}일</strong>
              </div>
              <div>
                <span>총 운동 소비</span>
                <strong>{formatBurnedCalories(monthlyBurnedCalories)}</strong>
              </div>
              <div>
                <span>총 레시피 섭취</span>
                <strong>{monthlyIntakeCalories}kcal</strong>
              </div>
              <div>
                <span>순 칼로리</span>
                <strong>{monthlyNetCalories > 0 ? "+" : ""}{monthlyNetCalories}kcal</strong>
              </div>
            </div>

            {monthlyLogs.length === 0 ? (
              <p className="monthly-empty">선택한 달에는 아직 저장된 운동·레시피 기록이 없습니다.</p>
            ) : (
              <div className="monthly-list">
                {visibleMonthlyLogs.map((log) => (
                  <article className="monthly-item" key={log.id}>
                    <div>
                      <span className="tag">{log.workout_date}</span>
                      <strong>
                        {log.selected_crop ?? "선택 작물 없음"} /{" "}
                        {log.selected_recipe ?? "레시피 없음"}
                      </strong>
                      <p>
                        운동 소비 {formatBurnedCalories(log.calories_burned)} · 섭취{" "}
                        {log.selected_recipe_nutrition?.calories ?? 0}kcal
                      </p>
                      <p>
                        단백질 {log.selected_recipe_nutrition?.protein ?? 0}g · 탄수화물{" "}
                        {log.selected_recipe_nutrition?.carbs ?? 0}g · 지방{" "}
                        {log.selected_recipe_nutrition?.fat ?? 0}g
                      </p>
                    </div>
                    <span className="monthly-count">
                      {(log.selected_recipe_nutrition?.calories ?? 0) -
                        (log.calories_burned ?? 0)}
                      kcal
                    </span>
                  </article>
                ))}
              </div>
            )}
            {monthlyLogs.length > 5 && (
              <button
                className="show-more-button"
                type="button"
                onClick={() => setShowAllMonthlyLogs((current) => !current)}
              >
                {showAllMonthlyLogs
                  ? "월간 기록 접기"
                  : `월간 기록 더보기 (${monthlyLogs.length - 5}개)`}
              </button>
            )}
          </div>

          <p className="medical-note">
            이 서비스는 운동 후 식단 참고용이며 질병 진단이나 치료를 대신하지 않습니다.
          </p>
        </section>
      </section>
    </main>
  );
}

export default App;
