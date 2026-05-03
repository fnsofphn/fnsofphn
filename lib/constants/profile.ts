export const defaultProfile = {
  birthDate: "1997-04-09",
  westernZodiacLabel: "Bạch Dương",
  lunarYearLabel: "Đinh Sửu",
  elementLabel: "Giản Hạ Thủy"
};

export const energyCategories = [
  {
    value: "emotional_release",
    label: "Giải tỏa cảm xúc",
    description: "Phục hồi bằng cách cho cảm xúc có đường thoát an toàn."
  },
  {
    value: "body_rhythm",
    label: "Nhịp cơ thể",
    description: "Lặp lại động tác đơn giản để đưa hệ thần kinh về nhịp ổn định."
  },
  {
    value: "imagination_flow",
    label: "Dòng tưởng tượng",
    description: "Đọc, nhập vai và bước vào một thế giới giúp tâm trí mềm lại."
  },
  {
    value: "deep_work_calm",
    label: "Tĩnh sâu khi làm việc",
    description: "Làm việc tập trung trong nền nhạc êm, ít ma sát."
  },
  {
    value: "skill_drilling",
    label: "Luyện kỹ năng",
    description: "Tối đa hóa một kỹ năng cụ thể qua lặp lại có chủ đích."
  },
  {
    value: "practical_learning",
    label: "Học thực dụng",
    description: "Nạp kiến thức dùng được ngay cho đời sống và công việc."
  }
] as const;

export type EnergyCategory = (typeof energyCategories)[number]["value"];

export const defaultEnergyActivities = [
  {
    name: "Hát to để giải tỏa cảm xúc",
    category: "emotional_release",
    description: "Một phiên xả cảm xúc bằng giọng, không cần hoàn hảo."
  },
  {
    name: "Tập đi tập lại những động tác cầu đơn giản",
    category: "body_rhythm",
    description: "Lặp nhịp cơ thể để tích lũy cảm giác ổn định."
  },
  {
    name: "Flow đọc truyện và nhập vai nhân vật giả tưởng",
    category: "imagination_flow",
    description: "Cho trí tưởng tượng được chảy tự nhiên qua nhân vật."
  },
  {
    name: "Coding với nhạc nền êm ái",
    category: "deep_work_calm",
    description: "Một khối làm việc tĩnh, sâu, có nhạc nền làm mềm hệ thần kinh."
  },
  {
    name: "Game tập trung luyện tối đa kỹ năng một tướng",
    category: "skill_drilling",
    description: "Drill một kỹ năng thật hẹp, ví dụ Yasuo E Q Flash."
  },
  {
    name: "Học hỏi kiến thức thực dụng",
    category: "practical_learning",
    description: "Chọn kiến thức có thể dùng ngay, ghi lại một ứng dụng cụ thể."
  }
] as const;
