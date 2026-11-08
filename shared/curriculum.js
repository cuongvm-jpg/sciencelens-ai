// Kiến thức neo theo khối để giới hạn nội dung AI; không phải bản thay thế SGK.
export const CURRICULUM = {
  6: [
    {id:'change', title:'Sự chuyển thể', icon:'🧊', scene:'Đá viên tan thành nước', anchor:'Nước đá và nước lỏng là cùng một chất: nước. Nóng chảy là chuyển thể vật lí, không tạo chất mới.', sample:'Đá tan', avoid:'Không nói về liên kết phân tử, nhiệt nóng chảy riêng hay phương trình nhiệt lượng.'},
    {id:'friction', title:'Lực ma sát', icon:'🛝', scene:'Một quyển sách trượt trên bàn', anchor:'Lực ma sát xuất hiện khi các bề mặt tương tác và có thể cản trở chuyển động trượt. Bề mặt khác nhau cho lực ma sát khác nhau.', sample:'Sách trượt', avoid:'Không dùng hệ số ma sát hoặc công thức lực ma sát.'},
    {id:'energy', title:'Năng lượng', icon:'🔦', scene:'Đèn pin được bật sáng', anchor:'Đèn pin dùng năng lượng của pin, biến đổi thành ánh sáng và có thể có nhiệt; không tự phát sáng mà không cần nguồn năng lượng.', sample:'Đèn pin', avoid:'Không giải thích bằng electron, mạch điện chi tiết hay hiệu suất.'}
  ],
  7: [
    {id:'reflection', title:'Phản xạ ánh sáng', icon:'🪞', scene:'Một chiếc gương phản chiếu vật', anchor:'Ánh sáng từ vật đến gương và phản xạ vào mắt giúp ta thấy ảnh trong gương; gương không tự phát ra ánh sáng từ vật.', sample:'Chiếc gương', avoid:'Không dùng khúc xạ, chiết suất hay công thức thấu kính.'},
    {id:'sound', title:'Âm thanh', icon:'🎸', scene:'Dây đàn đang rung', anchor:'Vật dao động phát ra âm; âm truyền được trong chất khí, lỏng, rắn nhưng không truyền trong chân không.', sample:'Dây đàn', avoid:'Không dùng phương trình sóng hay tần số nâng cao.'},
    {id:'magnet', title:'Nam châm', icon:'🧲', scene:'Nam châm hút kẹp giấy', anchor:'Nam châm hút vật bằng sắt và một số vật liệu có tính từ; không phải kim loại nào cũng bị nam châm hút mạnh.', sample:'Nam châm', avoid:'Không giải thích miền từ, mômen từ vi mô hay lực Lorentz.'}
  ],
  8: [
    {id:'pressure', title:'Áp suất chất lỏng', icon:'💧', scene:'Hai lỗ trên chai nước ở độ cao khác nhau', anchor:'Trong chất lỏng đứng yên, áp suất tại điểm sâu hơn lớn hơn; ở cùng độ sâu và cùng chất lỏng, áp suất không phụ thuộc bề rộng đáy bình.', sample:'Chai nước', avoid:'Không dùng phương trình Bernoulli, dòng chảy phức tạp hoặc giải tích.'},
    {id:'lever', title:'Đòn bẩy', icon:'⚖️', scene:'Thước đặt trên điểm tựa', anchor:'Tác dụng làm quay của lực phụ thuộc độ lớn lực và cánh tay đòn; thay đổi vị trí điểm tựa có thể thay đổi lợi về lực.', sample:'Đòn bẩy', avoid:'Không dùng mômen quán tính hoặc động lực học quay nâng cao.'},
    {id:'heat', title:'Sự truyền nhiệt', icon:'🥄', scene:'Thìa kim loại trong cốc nước ấm', anchor:'Nhiệt truyền từ vật nóng hơn sang vật lạnh hơn; kim loại thường dẫn nhiệt tốt hơn nhựa trong cùng điều kiện.', sample:'Thìa trong nước', avoid:'Không dùng phương trình truyền nhiệt vi phân hay cơ học thống kê.'}
  ],
  9: [
    {id:'refraction', title:'Khúc xạ ánh sáng', icon:'🥛', scene:'Bút chì nhìn như gãy khi cắm vào cốc nước', anchor:'Tia sáng truyền xiên qua mặt phân cách nước–không khí có thể đổi phương; ảnh phần bút dưới nước lệch vị trí nhìn thấy, bút không thật sự gãy.', sample:'Bút trong nước', avoid:'Không dùng công thức chiết suất biến thiên hoặc quang hình chuyên sâu.'},
    {id:'lens', title:'Thấu kính', icon:'🔍', scene:'Kính lúp quan sát chữ', anchor:'Kính lúp là thấu kính hội tụ có thể tạo ảnh ảo cùng chiều, lớn hơn khi vật đặt gần thấu kính hơn tiêu cự.', sample:'Kính lúp', avoid:'Không dùng quang sai bậc cao hoặc công thức ma trận quang học.'},
    {id:'circuit', title:'Mạch điện đơn giản', icon:'🔋', scene:'Pin nhỏ cấp điện cho bóng đèn mini', anchor:'Mạch kín cho phép dòng điện chạy qua; độ sáng của bóng phụ thuộc đặc điểm mạch, nguồn và bóng đèn, không thể khẳng định chỉ từ số bóng.', sample:'Pin và bóng đèn', avoid:'Không dùng điện xoay chiều, điện lưới, giải mạch phức tạp.'}
  ]
};
export function listTopics(grade){ return CURRICULUM[Number(grade)] || CURRICULUM[8]; }
export function getTopic(grade,id){ return listTopics(grade).find(t=>t.id===id) || null; }
