// 1. Cấu hình URL API của bạn
const apiUrl = 'https://api.cuaban.com/save-data';

// ==========================================
// PHẦN 1: TỰ ĐỘNG LẤY PARAMETER URL ĐIỀN FORM
// ==========================================
function autoFillForm() {
    const urlParams = new URLSearchParams(window.location.search);
    const paramMaThe = urlParams.get('mathe');
    const paramHoTen = urlParams.get('hoten');
    const paramNgaySinh = urlParams.get('ngaysinh');

    if (paramMaThe) {
        const inputMaThe = document.getElementById('txtMaThe');
        if (inputMaThe) { 
            inputMaThe.value = paramMaThe; 
            inputMaThe.dispatchEvent(new Event('input', { bubbles: true })); 
        }
    }
    if (paramHoTen) {
        const inputHoTen = document.getElementById('txtHoTen');
        if (inputHoTen) { 
            inputHoTen.value = paramHoTen; 
            inputHoTen.dispatchEvent(new Event('input', { bubbles: true })); 
        }
    }
    if (paramNgaySinh) {
        const inputNgaySinh = document.getElementById('txtNgaySinh');
        if (inputNgaySinh) { 
            inputNgaySinh.value = paramNgaySinh; 
            inputNgaySinh.dispatchEvent(new Event('input', { bubbles: true })); 
        }
    }
}

// ==========================================
// PHẦN 2: TRÍCH XUẤT DỮ LIỆU & GỬI API
// ==========================================
function extractAndSaveData() {
    const spanHoTen = document.querySelector('.ketqua-tracuu .hoten');
    const spanHieuLuc = document.querySelector('.ketqua-tracuu .hieuluc');
    const inputNgaySinh = document.getElementById('txtNgaySinh');

    // Nếu chưa có kết quả hợp lệ trên màn hình thì bỏ qua
    if (!spanHoTen) return;

    const textHoTen = spanHoTen.textContent || '';
    const textHieuLuc = spanHieuLuc ? spanHieuLuc.textContent : '';
    const ngaySinhTuForm = inputNgaySinh ? inputNgaySinh.value.trim() : '';

    // Dùng Regex bóc tách dữ liệu gốc
    const matchMaThe = textHoTen.match(/Mã thẻ:\s*([A-Z0-9]+)/);
    const matchHoTen = textHoTen.match(/Họ tên:\s*([^,]+)/);
    const matchHanThe = textHieuLuc.match(/Hạn thẻ:\s*([^;]+)/);
    const match5Nam = textHieuLuc.match(/Thời điểm đủ 5 năm liên tục:\s*([^)]+)/);

    // Xử lý 10 số cuối mã số BHXH
    let maTheGoc = matchMaThe ? matchMaThe[1].trim() : '';
    let maSoBhxh = '';
    if (maTheGoc.length >= 10) {
        maSoBhxh = maTheGoc.slice(-10);
    }

    // Tách chuỗi hạn thẻ
    let hanTheTuNgay = '';
    let hanTheDenNgay = '';
    if (matchHanThe) {
        const dates = matchHanThe[1].split('-');
        if (dates.length === 2) {
            hanTheTuNgay = dates[0].trim();
            hanTheDenNgay = dates[1].trim();
        }
    }

    // Tạo JSON cấu trúc camelCase
    const payloadData = {
        maSoBhxh: maSoBhxh,
        hoTen: matchHoTen ? matchHoTen[1].trim() : '',
        ngaySinh: ngaySinhTuForm, 
        hanTheTuNgay: hanTheTuNgay,
        hanTheDenNgay: hanTheDenNgay,
        du5NamLienTuc: match5Nam ? match5Nam[1].trim() : '',
        ngayTraCuu: new Date().toISOString()
    };

    console.log('Tiện ích BHXH phát hiện kết quả mới! Đang gửi:', payloadData);

    // Gửi dữ liệu qua API bằng Fetch
    fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadData)
    })
    .then(response => {
        if (response.ok) {
            alert('Tiện ích BHXH: Đã tự động lưu kết quả thành công vào CSDL!');
        } else {
            console.error('Tiện ích BHXH: Gửi API thất bại. Lỗi:', response.status);
        }
    })
    .catch(error => console.error('Tiện ích BHXH: Lỗi kết nối API:', error));
}

// ==========================================
// PHẦN 3: KHỞI CHẠY TỰ ĐỘNG
// ==========================================
// 1. Chạy ngay lệnh điền form khi vừa load xong trang
autoFillForm();

// 2. Lắng nghe thay đổi AJAX ở vùng kết quả #tcContainer
const targetContainer = document.getElementById('tcContainer');
if (targetContainer) {
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length > 0) {
                extractAndSaveData();
            }
        });
    });

    observer.observe(targetContainer, { childList: true, subtree: true });
    console.log('Tiện ích BHXH: Đã kích hoạt chế độ tự động lắng nghe kết quả tra cứu.');
    
    // Kiểm tra luôn nếu trang đã có sẵn dữ liệu từ trước
    extractAndSaveData();
}