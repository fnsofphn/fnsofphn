import type { Json } from "@/types/database";

export type SampleQuestion = {
  section: string;
  question_number: number;
  question_type: "single_choice" | "true_false" | "short_answer";
  prompt: string;
  options: Json;
  correct_answer: Json;
  points: number;
  explanation?: string;
  needs_review?: boolean;
  sort_order: number;
};

export type SampleExam = {
  title: string;
  description: string;
  subject: string;
  duration_minutes: number;
  slugSuffix: string;
  source_file_name: string;
  is_active: boolean;
  questions: SampleQuestion[];
};

const choice = (a: string, b: string, c: string, d: string) => [
  { key: "A", text: a },
  { key: "B", text: b },
  { key: "C", text: c },
  { key: "D", text: d }
];

export const sampleGiupCyExams: SampleExam[] = [
  {
    title: "Cuối HKI lớp 12 - Sở Hưng Yên 2025-2026",
    description:
      "Đề được dựng trước từ file Word gốc. File hiện chưa có đáp án, các câu có công thức/hình cần rà lại trước khi active rộng.",
    subject: "Hóa học",
    duration_minutes: 50,
    slugSuffix: "hung-yen-hki-hoa-12-2026",
    source_file_name: "05.2025-2026 Cuối Học Kì 1 Sở Hưng Yên - đề.docx",
    is_active: false,
    questions: [
      {
        section: "Phần I",
        question_number: 1,
        question_type: "single_choice",
        prompt: "Carbohydrate là những hợp chất hữu cơ tạp chức hầu hết có công thức chung là gì?",
        options: choice("Công thức trong file gốc cần rà lại", "Công thức trong file gốc cần rà lại", "Công thức trong file gốc cần rà lại", "Công thức trong file gốc cần rà lại"),
        correct_answer: null,
        points: 0.25,
        needs_review: true,
        sort_order: 1
      },
      {
        section: "Phần I",
        question_number: 2,
        question_type: "single_choice",
        prompt: "Có bao nhiêu dipeptide mạch hở khi thủy phân hoàn toàn thu được hỗn hợp chỉ gồm glycine và alanine?",
        options: choice("4", "2", "3", "1"),
        correct_answer: null,
        points: 0.25,
        needs_review: true,
        sort_order: 2
      },
      {
        section: "Phần I",
        question_number: 5,
        question_type: "single_choice",
        prompt:
          "Cho một số tính chất: có dạng sợi (1); tan trong nước (2); tan trong nước Schweizer (3); phản ứng với nitric acid đặc, xúc tác sulfuric acid đặc (4); tham gia phản ứng với thuốc thử Tollens (5); bị thủy phân trong dung dịch acid đun nóng (6). Các tính chất của cellulose là gì?",
        options: choice("(1), (3), (4) và (6)", "(3), (4), (5) và (6)", "(1), (2), (3) và (4)", "(2), (3), (4) và (5)"),
        correct_answer: null,
        points: 0.25,
        needs_review: true,
        sort_order: 3
      },
      {
        section: "Phần II",
        question_number: 1,
        question_type: "true_false",
        prompt: "Pin cúc áo sử dụng kẽm: đánh dấu đúng/sai cho bốn nhận định a, b, c, d trong file gốc.",
        options: [
          { key: "a", text: "Thế điện cực chuẩn của pin là 1,558 V." },
          { key: "b", text: "Zn là điện cực âm." },
          { key: "c", text: "Khi pin hoạt động, tại cathode xảy ra quá trình trong file gốc." },
          { key: "d", text: "Thời gian pin chạy tối đa là 446,76 ngày." }
        ],
        correct_answer: null,
        points: 1,
        needs_review: true,
        sort_order: 4
      },
      {
        section: "Phần III",
        question_number: 1,
        question_type: "short_answer",
        prompt:
          "Indigo dye là thuốc nhuộm màu xanh lam đậm. Phần trăm khối lượng của nitrogen trong phân tử Indigo dye là bao nhiêu phần trăm? Làm tròn đến hàng phần mười.",
        options: [],
        correct_answer: null,
        points: 0.5,
        needs_review: true,
        sort_order: 5
      }
    ]
  },
  {
    title: "Thi thử THPT 2026 - THPT Cẩm Phả lần 1",
    description:
      "Đề có phần hướng dẫn giải trong file gốc. Một số câu đã có đáp án rõ để chấm tự động, các câu có hình/công thức vẫn được đánh dấu cần rà.",
    subject: "Hóa học",
    duration_minutes: 50,
    slugSuffix: "cam-pha-lan-1-hoa-2026",
    source_file_name: "22. THPT CẨM PHẢ (LẦN 1) - QUẢNG NINH - [Thi thử Tốt Nghiệp THPT 2026 - Môn Hóa Học ].Image.Marked.docx",
    is_active: true,
    questions: [
      {
        section: "Phần I",
        question_number: 1,
        question_type: "single_choice",
        prompt:
          "Thủy phân một phần insulin thu được heptapeptide X. Khi thủy phân không hoàn toàn X thu được Ser-His-Leu; Val-Glu-Ala; His-Leu-Val; Gly-Ser-His. Nếu đánh số amino acid đầu N trong X là số 1 thì amino acid Glu ở vị trí số mấy?",
        options: choice("3", "5", "4", "6"),
        correct_answer: "D",
        points: 0.25,
        explanation: "Từ các mảnh peptide suy ra X là Gly-Ser-His-Leu-Val-Glu-Ala.",
        sort_order: 1
      },
      {
        section: "Phần I",
        question_number: 2,
        question_type: "single_choice",
        prompt:
          "Một chai chứa 500 gam dịch truyền glucose 5% cung cấp tối đa m kJ năng lượng. Biết 1 gam glucose cung cấp 10 kJ. Giá trị của m là bao nhiêu?",
        options: choice("400", "250", "300", "500"),
        correct_answer: "B",
        points: 0.25,
        explanation: "500 x 0,05 x 10 = 250 kJ.",
        sort_order: 2
      },
      {
        section: "Phần I",
        question_number: 3,
        question_type: "single_choice",
        prompt: "Polypropylene (PP) được tổng hợp từ monomer nào?",
        options: choice("CH3CH=CH2", "C6H5OH và HCHO", "CH2=CH2", "CH2=CHCN"),
        correct_answer: "A",
        points: 0.25,
        sort_order: 3
      },
      {
        section: "Phần I",
        question_number: 4,
        question_type: "single_choice",
        prompt:
          "Cho E° Fe2+/Fe = -0,44 V, Cu2+/Cu = +0,34 V, Zn2+/Zn = -0,76 V, Ag+/Ag = +0,80 V. Pin Galvani nào có sức điện động chuẩn 0,78 V?",
        options: choice("Zn-Fe", "Fe-Cu", "Zn-Ag", "Cu-Ag"),
        correct_answer: "B",
        points: 0.25,
        explanation: "0,34 - (-0,44) = 0,78 V.",
        sort_order: 4
      },
      {
        section: "Phần I",
        question_number: 5,
        question_type: "single_choice",
        prompt:
          "Yếu tố áp suất không ảnh hưởng đến chuyển dịch cân bằng của phản ứng nào: (1) H2 + I2 ⇄ 2HI; (2) Fe2O3 + 3CO ⇄ 2Fe + 3CO2; (3) 2NO2 ⇄ N2O4?",
        options: choice("(1); (2)", "(2)", "(3)", "(1)"),
        correct_answer: "A",
        points: 0.25,
        sort_order: 5
      },
      {
        section: "Phần I",
        question_number: 6,
        question_type: "single_choice",
        prompt: "Chất nào sau đây thuộc loại disaccharide?",
        options: choice("Saccharose", "Fructose", "Tinh bột", "Cellulose"),
        correct_answer: "A",
        points: 0.25,
        sort_order: 6
      },
      {
        section: "Phần II",
        question_number: 19,
        question_type: "true_false",
        prompt: "Vụn đá hoa và dung dịch HCl: đánh dấu đúng/sai cho bốn nhận định.",
        options: [
          { key: "a", text: "Yếu tố chính làm thay đổi tốc độ phản ứng là diện tích tiếp xúc của vụn đá hoa." },
          { key: "b", text: "Tốc độ phản ứng trung bình trong 100 giây đầu tiên của thí nghiệm 1 và 2 lần lượt là 0,7 và 0,8 cm3/s." },
          { key: "c", text: "Thí nghiệm 1 có đồ thị ứng với đường (a), thí nghiệm 2 ứng với đường (b)." },
          { key: "d", text: "Khi phản ứng kết thúc, tổng thể tích CO2 ở hai thí nghiệm bằng nhau vì lượng đá hoa dùng như nhau." }
        ],
        correct_answer: { a: true, b: true, c: false, d: true },
        points: 1,
        explanation: "Theo hướng dẫn giải trong file: Đúng, Đúng, Sai, Đúng.",
        sort_order: 7
      },
      {
        section: "Phần III",
        question_number: 23,
        question_type: "short_answer",
        prompt:
          "Tính khối lượng CaO theo gam cần cung cấp để làm nóng 250 mL coffee từ 10°C đến 40°C. Làm tròn đến hàng đơn vị.",
        options: [],
        correct_answer: "34",
        points: 0.5,
        explanation: "Hướng dẫn giải trong file ghi đáp án 34.",
        sort_order: 8
      }
    ]
  }
];
