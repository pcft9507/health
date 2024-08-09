// 모달 열기
function openModal(modalId, msg) {
	// 모든 .sp-md 요소를 찾음
	let modals = document.querySelectorAll('.sp-md');
	// 각 모달 요소에 대해
	modals.forEach(modal => {
		// data-modal 속성이 매개변수로 받은 modalId와 일치하는지 확인
		if (modal.getAttribute('data-modal') === modalId) {
			// .sp-md__cont 요소를 찾아 msg가 있을 경우 텍스트값을 설정
      let contentElement = modal.querySelector('.sp-md__cont');
      if (msg && contentElement) {
        contentElement.textContent = msg;
      }
      // 일치하면 active 클래스를 추가
      modal.classList.add('active');
		}
	});
}

// 모달 닫기
function handleModalClick(modal, event) {
	// 클릭한 요소가 .sp-md__close 버튼이면
	if (event.target.classList.contains('sp-md__close')) {
		// 버튼의 부모 요소 중 .sp-md 클래스가 있는 요소를 찾아서 active 클래스를 제거
		if (modal) {
			modal.classList.remove('active');
		}
	} else {
		// 클릭한 요소가 .sp-md__mc 영역 밖이라면
		if (!event.target.closest('.sp-md__mc')) {
			// .sp-md 클래스가 있는 요소에서 active 클래스를 제거
			if (modal.classList.contains('sp-md')) {
				modal.classList.remove('active');
			}
		}
	}
}

// textarea maxlength, 숫자 카운트
class TextareaCounter {
	constructor(textareaElement, maxChars) {
		this.textarea = document.querySelector(textareaElement);
		this.currentCount = this.textarea.nextElementSibling.querySelector('.textarea__current');
		this.totalCount = this.textarea.nextElementSibling.querySelector('.textarea__total');
		this.maxChars = maxChars;

		this.init();
	}

	init() {
		this.textarea.setAttribute('maxlength', this.maxChars);
		this.totalCount.textContent = this.maxChars;
		this.updateCurrentCount();

		this.textarea.addEventListener('input', () => {
			this.updateCurrentCount();
		});

		// IME 입력 처리를 위한 이벤트 리스너 추가
		this.textarea.addEventListener('compositionstart', () => {
			this.isComposing = true;
		});

		this.textarea.addEventListener('compositionend', () => {
			this.isComposing = false;
			this.updateCurrentCount();
		});
	}

	updateCurrentCount() {
		// IME 입력 중에는 카운트 업데이트를 하지 않음
		if (this.isComposing) return;

		const currentLength = this.textarea.value.length;
		this.currentCount.textContent = currentLength;
	}
}

// 셀렉트 바텀시트
class BottomSheetCombo {
  constructor(comboSelector) {
    this.combos = document.querySelectorAll(comboSelector);
    this.init();
  }

  init() {
    this.combos.forEach(combo => {
      const comboBtn = combo.querySelector('.bs-combo__btn');
      const comboBox = combo.querySelector('.bs-combo__box');
      const comboCont = combo.querySelector('.bs-combo__cont');
      const comboBtnTxt = combo.querySelector('.bs-combo__btn-txt');

      comboBtn.addEventListener('click', (event) => {
        this.toggleCombo(comboBox);
        event.stopPropagation(); // 버튼 클릭 시 이벤트 전파를 막음
      });

      document.addEventListener('click', (event) => {
        if (!comboCont.contains(event.target) && comboBox.classList.contains('open')) {
          comboBox.classList.remove('open');
        }
      });

      this.observeListChanges(combo);
      this.addRadioListeners(combo);
    });
  }

  toggleCombo(comboBox) {
    this.combos.forEach(combo => {
      const box = combo.querySelector('.bs-combo__box');
      if (box !== comboBox) {
        box.classList.remove('open');
      }
    });
    comboBox.classList.toggle('open');
  }

  selectOption(event, comboBtnTxt, comboBox) {
    const selectedLabel = event.target.closest('.bs-combo__label');
    const selectedText = selectedLabel.querySelector('.bs-combo__txt').textContent;
    comboBtnTxt.textContent = selectedText;
    comboBox.classList.remove('open');
  }

  observeListChanges(combo) {
    const list = combo.querySelector('.bs-combo__list');
    const observer = new MutationObserver(() => {
      this.addRadioListeners(combo);
    });

    observer.observe(list, { childList: true, subtree: true });
  }

  addRadioListeners(combo) {
    const comboBtnTxt = combo.querySelector('.bs-combo__btn-txt');
    const comboBox = combo.querySelector('.bs-combo__box');
    const labels = combo.querySelectorAll('.bs-combo__label input[type="radio"]');

    labels.forEach(label => {
      label.addEventListener('change', (event) => {
        this.selectOption(event, comboBtnTxt, comboBox);
      });
    });
  }
}
  
// 멀티 파일 업로드
class MultiFile {
  constructor(selector, maxFiles, fileExtensions, maxFileSizeMB) {
    this.container = document.querySelector(selector);
    this.maxFiles = maxFiles || 5; // 기본 최대 파일 수를 5개로 설정
    this.currentFileCount = 0;
    this.fileList = []; // 선택된 파일을 저장하는 배열
    this.allowedExtensions = fileExtensions.map(ext => ext.toLowerCase()); // 허용할 확장자 목록을 소문자로 변환하여 저장
    this.maxFileSizeMB = maxFileSizeMB; // 파일당 최대 파일 사이즈

    this.init();
  }

  init() {
    this.fileWrap = this.container.querySelector(".mfu__list");
    this.info = this.container.querySelector(".mfu__info");
    this.fileInput = this.container.querySelector("#inpMultiFile");
    this.addFileButton = this.container.querySelector("#addMultiFileButton");
    this.maxTxt = this.container.querySelector('.g-txt .cnt');
    this.maxTxt2 = this.container.querySelector('.g-txt .max');
    this.addRow = this.container.querySelector(".add-row");

    this.maxTxt.textContent = this.maxFiles;
    this.maxTxt2.textContent = this.maxFileSizeMB;
    console.log('----------\n멀티 파일 업로드\n허용할 확장자명:', this.allowedExtensions, '\n-----------');

    this.addFileButton.addEventListener("click", () => this.fileInput.click());
    this.fileInput.addEventListener('change', () => this.handleFileSelect());
  }

  handleFileSelect() {
    const newFiles = Array.from(this.fileInput.files);

    // 파일 갯수 초과 메세지 삭제
    const errorText = document.querySelector('.mfu__error');
    if (errorText) {
      errorText.remove();
    }

    let invalidFiles = false;

    newFiles.forEach(file => {
      const fileExtension = file.name.split('.').pop().toLowerCase();

      let maxFilesExceeded = this.fileList.length >= this.maxFiles;

      if (maxFilesExceeded) {
        if (!document.querySelector('.mfu__error.max-files')) {
          this.info.insertAdjacentHTML('afterEnd', `<p class="mfu__error max-files">파일이 ${this.maxFiles}개를 초과했습니다.</p>`);
        }
        this.fileInput.value = ''; // 파일 입력 초기화
        return;
      } else if (file.size > this.maxFileSizeMB * 1024 * 1024) { // 파일 용량이 최대 허용 용량을 초과하는 경우
        invalidFiles = true;
        this.info.insertAdjacentHTML('afterEnd', `<p class="mfu__error">파일 ${file.name}의 용량이 ${this.maxFileSizeMB}MB를 초과합니다.</p>`);
      } else if (!this.allowedExtensions.includes(fileExtension)) { // 허용되지 않은 확장자인 경우
        invalidFiles = true;
        this.info.insertAdjacentHTML('afterEnd', `<p class="mfu__error">파일 ${file.name}은 업로드할 수 없습니다.</p>`);
      } else if (this.fileList.some(existingFile => existingFile.name === file.name)) { // 이미 등록된 파일인 경우
        invalidFiles = true;
        this.info.insertAdjacentHTML('afterEnd', `<p class="mfu__error">파일 ${file.name}은 이미 등록된 파일입니다.</p>`);
      } else {
        this.fileList.push(file);
        this.addFileItem(file);
      }
    });

    if (invalidFiles) {
      this.fileInput.value = ''; // 유효하지 않은 파일이 있을 경우 파일 입력 초기화
    } else {
      this.updateFileInput();
    }

    if (this.fileList.length >= this.maxFiles) {
      this.addRow.style.display = "none";
    }

    // 파일이 추가될 때 확인 메시지 삽입
    if (this.fileList.length > 0 && !this.container.querySelector('.check-wrap')) {
      this.addConfirmationMessage();
    }
  }

  addFileItem(file) {
    const fileItem = document.createElement('li');
    fileItem.classList.add('mfu__item');

    const fileInputTxt = document.createElement('input');
    fileInputTxt.type = 'text';
    fileInputTxt.classList.add('mfu__file-txt', 'inp-txt');
    fileInputTxt.value = file.name;
    fileInputTxt.readOnly = true;

    const removeFileButton = document.createElement('button');
    removeFileButton.type = 'button';
    removeFileButton.classList.add('btn');
    removeFileButton.classList.add('remove');
    removeFileButton.textContent = '파일 제거';
    removeFileButton.addEventListener('click', () => this.removeFileItem(file));

    fileItem.appendChild(fileInputTxt);
    fileItem.appendChild(removeFileButton);

    this.fileWrap.appendChild(fileItem);
  }

  removeFileItem(file) {
    this.fileList = this.fileList.filter(f => f !== file);
    this.updateFileListDisplay();
    this.updateFileInput();

    if (this.fileList.length < this.maxFiles) {
      this.addRow.style.display = "inline-block"; // 파일 추가 버튼 보이기
    }
    
    const errorText = document.querySelector('.mfu__error');
    if (errorText) {
      errorText.remove();
    }

    // 파일이 0개가 되면 확인 메시지 제거
    if (this.fileList.length === 0) {
      this.removeConfirmationMessage();
    }
  }

  updateFileListDisplay() {
    this.fileWrap.innerHTML = ''; // 기존 파일 목록 초기화
    this.fileList.forEach(file => this.addFileItem(file));
  }

  updateFileInput() {
    const dataTransfer = new DataTransfer();
    this.fileList.forEach(file => dataTransfer.items.add(file));
    this.fileInput.files = dataTransfer.files;

    console.log(this.fileInput.files); // 콘솔에 파일 목록 출력
  }

  addConfirmationMessage() {
    const confirmationHTML = `
      <div class="check-wrap mt-17">
        <strong class="check-tit">파일 첨부에 관한 고객 확인</strong>
        <p class="check-txt">개인 정보 보호의 일환으로 해당 서비스 접수 시 “파일 첨부”에 환자 의료 정보(환자 성명, 환자 번호, 주민등록번호 등의 개인 식별 정보)가 포함되지 않았음을 확인합니다. 만약 본 서비스 이슈 접수 내용에 해당 정보가 포함되어 있다면 반드시 파일 삭제나 내용 삭제 후 접수를 부탁드립니다.</p>
        <div class="checkbox-label mt-14">
          <input type="checkbox" id="multiFileAgree" class="checkbox-label__checkbox checkbox" value="Y">
          <label for="multiFileAgree" class="checkbox-label__label rq-agree">(필수) 확인했습니다.</label>
        </div>
      </div>
    `;
    this.container.insertAdjacentHTML('beforeend', confirmationHTML);
  }

  removeConfirmationMessage() {
    const confirmationElement = this.container.querySelector('.check-wrap');
    if (confirmationElement) {
      confirmationElement.remove();
    }
  }
}

// 풀팝업
// 열기
function openFpop(popupId) {
  const popup = document.querySelector(`.f-pop[data-popup-id="${popupId}"]`);
  if (popup) {
      popup.classList.add('open');
  }
}
// 풀팝업
// 닫기
function closeFpop(popupId) {
  const popup = document.querySelector(`.f-pop[data-popup-id="${popupId}"]`);
  if (popup) {
      popup.classList.remove('open');
  }
}

// 어드민 레이어 팝업
// 열기
function openLpop(popupId) {
  const popup = document.querySelector(`.lpop[data-popup-id="${popupId}"]`);
  if (popup) {
      popup.classList.add('open');
      popup.style.left = '50%';
      popup.style.top = '50%';
      popup.style.transform = 'translate(-50%, -50%)';
  }
}

// 닫기
function closeLpop(popupId) {
  const popup = document.querySelector(`.lpop[data-popup-id="${popupId}"]`);
  if (popup) {
      popup.classList.remove('open');
  }
}

// 타이틀로 사이드 메뉴 활성화
function addClassOnToMatchingText() {
  const pageTitleElement = document.querySelector('.adm-page-title');
  const subBtns = document.querySelectorAll('.gnb__sub-btn');

  if (pageTitleElement) {
    const pageTitle = pageTitleElement.textContent.trim();

    subBtns.forEach(function (btn) {
      if (pageTitle === '인쇄하기') {
        if (btn.textContent.trim() === 'QR 코드 출력') {
          btn.classList.add('on');
        }
      } else {
        if (btn.textContent.replace(/\s+/g, '') === pageTitle.replace(/\s+/g, '')) {
          btn.classList.add('on');

          // 부모 요소인 .gnb__category에 on 클래스 추가
          const category = btn.closest('.gnb__category');
          if (category) {
            category.classList.add('on');
          }
        }
      }
    });
  }
}

// 드래그에이블
function makeElementsDraggable(handleSelector, elementSelector) {
  const handles = document.querySelectorAll(handleSelector);
  const element = document.querySelector(elementSelector);
  let offsetX = 0, offsetY = 0, isDragging = false;

  handles.forEach(handle => {
    handle.addEventListener('mousedown', function (e) {
      isDragging = true;
      // 초기 드래그 시점에서 마우스 포인터의 위치를 기록
      offsetX = e.clientX - element.getBoundingClientRect().left;
      offsetY = e.clientY - element.getBoundingClientRect().top;
      document.body.style.userSelect = 'none'; // 텍스트 선택 방지
    });
  });

  document.addEventListener('mousemove', function (e) {
    if (isDragging) {
      e.preventDefault(); // 기본 드래그 앤 드롭 동작 방지

      // 마우스 포인터 위치에 따라 요소를 이동
      element.style.left = (e.clientX - offsetX) + 'px';
      element.style.top = (e.clientY - offsetY) + 'px';
      element.style.transform = 'none';
    }
  });

  document.addEventListener('mouseup', function () {
    if (isDragging) {
      isDragging = false;
      document.body.style.userSelect = ''; // 텍스트 선택 방지 해제
    }
  });
}

// 전체 체크
function toggleCheckboxes(masterCheckboxClass, subCheckboxClass) {
  const masterCheckbox = document.querySelector('.' + masterCheckboxClass);
  const subCheckboxes = document.querySelectorAll('.' + subCheckboxClass);

  if (event.target === masterCheckbox) {
    // 마스터 체크박스를 클릭하면 disabled 속성이 없는 하위 체크박스를 선택/해제합니다.
    subCheckboxes.forEach(checkbox => {
      if (!checkbox.disabled) {
        checkbox.checked = masterCheckbox.checked;
      }
    });
  } else {
    // 하위 체크박스를 클릭하면 disabled 속성이 없는 체크박스만 확인하여 마스터 체크박스가 업데이트됩니다.
    const allChecked = Array.from(subCheckboxes).every(checkbox => checkbox.checked || checkbox.disabled);
    masterCheckbox.checked = allChecked;
  }

  // 체크된 서브 체크박스의 value 값을 하나씩 더한 배열 생성
  const checkedValues = [];
  subCheckboxes.forEach(checkbox => {
    if (checkbox.checked && !checkbox.disabled) {
      checkedValues.push(checkbox.value);
    }
  });
}

// 알림창
function openAlert(alertId) {
  // alertId에 해당하는 알림 요소를 찾습니다.
  var alertElement = document.querySelector(`[data-alert-id="${alertId}"]`);

  // 알림 요소가 존재하면 해당 요소를 보이게 합니다.
  if (alertElement) {
      alertElement.classList.add('open');
  }
}
function closeAlert(alertId) {
  // alertId에 해당하는 알림 요소를 찾습니다.
  var alertElement = document.querySelector(`[data-alert-id="${alertId}"]`);

  // 알림 요소가 존재하면 해당 요소를 닫습니다.
  if (alertElement) {
      alertElement.classList.remove('open');
  }
}

// 페이지 로드 되고 나서 실행
document.addEventListener('DOMContentLoaded', function () {

  // 타이틀로 사이드 메뉴 활성화
  addClassOnToMatchingText();

  // jquery ui 데이트피커 초기값 세팅
  $.datepicker.regional["ko"] = {
    closeText: "닫기",
    prevText: "이전달",
    nextText: "다음달",
    currentText: "오늘",
    monthNames: ["1월(JAN)","2월(FEB)","3월(MAR)","4월(APR)","5월(MAY)","6월(JUN)", "7월(JUL)","8월(AUG)","9월(SEP)","10월(OCT)","11월(NOV)","12월(DEC)"],
    monthNamesShort: ["1월","2월","3월","4월","5월","6월", "7월","8월","9월","10월","11월","12월"],
    dayNames: ["일","월","화","수","목","금","토"],
    dayNamesShort: ["일","월","화","수","목","금","토"],
    dayNamesMin: ["일","월","화","수","목","금","토"],
    weekHeader: "Wk",
    dateFormat: "yy-mm-dd",
    firstDay: 0,
    isRTL: false,
    showMonthAfterYear: true,
    yearSuffix: ""
  };

  // 데이트피커 지역
  $.datepicker.setDefaults($.datepicker.regional["ko"]);  
});