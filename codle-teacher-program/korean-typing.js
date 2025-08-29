// Korean Typing Effect Library
// 한글 자모 분리 및 조합을 통한 자연스러운 타이핑 효과

class KoreanTyping {
    constructor() {
        // 초성
        this.CHO = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
        // 중성
        this.JUNG = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];
        // 종성
        this.JONG = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
    }

    // 한글 음절을 자모로 분리
    disassemble(char) {
        const code = char.charCodeAt(0);
        
        // 한글이 아닌 경우
        if (code < 0xAC00 || code > 0xD7A3) {
            return [char];
        }
        
        const offset = code - 0xAC00;
        const jongIndex = offset % 28;
        const jungIndex = ((offset - jongIndex) / 28) % 21;
        const choIndex = (((offset - jongIndex) / 28) - jungIndex) / 21;
        
        const result = [this.CHO[choIndex], this.JUNG[jungIndex]];
        if (jongIndex !== 0) {
            result.push(this.JONG[jongIndex]);
        }
        
        return result;
    }

    // 자모를 조합하여 한글 음절 생성
    assemble(cho, jung, jong = '') {
        const choIndex = this.CHO.indexOf(cho);
        const jungIndex = this.JUNG.indexOf(jung);
        const jongIndex = this.JONG.indexOf(jong);
        
        if (choIndex === -1 || jungIndex === -1) {
            return cho + jung + jong;
        }
        
        const code = 0xAC00 + (choIndex * 21 * 28) + (jungIndex * 28) + jongIndex;
        return String.fromCharCode(code);
    }

    // 텍스트를 타이핑 단계로 분해
    getTypingSteps(text) {
        const steps = [];
        let current = '';
        
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const jamos = this.disassemble(char);
            
            if (jamos.length === 1) {
                // 한글이 아닌 경우
                current += char;
                steps.push(current);
            } else {
                // 한글인 경우 - 자모를 하나씩 조합
                let tempChar = '';
                for (let j = 0; j < jamos.length; j++) {
                    if (j === 0) {
                        tempChar = jamos[0];
                    } else if (j === 1) {
                        tempChar = this.assemble(jamos[0], jamos[1]);
                    } else if (j === 2) {
                        tempChar = this.assemble(jamos[0], jamos[1], jamos[2]);
                    }
                    steps.push(current + tempChar);
                }
                current += char;
            }
        }
        
        return steps;
    }

    // 타이핑 애니메이션 실행
    type(element, text, speed = 50, callback = null) {
        const steps = this.getTypingSteps(text);
        let index = 0;
        
        element.textContent = '';
        
        const typeNext = () => {
            if (index < steps.length) {
                element.textContent = steps[index];
                index++;
                setTimeout(typeNext, speed);
            } else if (callback) {
                callback();
            }
        };
        
        typeNext();
    }

    // HTML 요소를 유지하면서 타이핑 (innerHTML 사용)
    typeHTML(element, htmlContent, speed = 50, callback = null) {
        // HTML 태그를 파싱하여 텍스트 노드만 추출
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        
        const processNode = (node, parentElement) => {
            return new Promise((resolve) => {
                if (node.nodeType === Node.TEXT_NODE) {
                    // 텍스트 노드인 경우 타이핑
                    const text = node.textContent;
                    const steps = this.getTypingSteps(text);
                    let index = 0;
                    
                    const textSpan = document.createElement('span');
                    parentElement.appendChild(textSpan);
                    
                    const typeNext = () => {
                        if (index < steps.length) {
                            textSpan.textContent = steps[index];
                            index++;
                            setTimeout(typeNext, speed);
                        } else {
                            resolve();
                        }
                    };
                    
                    typeNext();
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    // 요소 노드인 경우 복제하고 자식 처리
                    const clonedNode = node.cloneNode(false);
                    parentElement.appendChild(clonedNode);
                    
                    // 자식 노드들을 순차적으로 처리
                    const children = Array.from(node.childNodes);
                    let childIndex = 0;
                    
                    const processNextChild = () => {
                        if (childIndex < children.length) {
                            processNode(children[childIndex], clonedNode).then(() => {
                                childIndex++;
                                processNextChild();
                            });
                        } else {
                            resolve();
                        }
                    };
                    
                    processNextChild();
                } else {
                    resolve();
                }
            });
        };
        
        element.innerHTML = '';
        processNode(tempDiv, element).then(() => {
            if (callback) callback();
        });
    }
}

// 전역 인스턴스 생성
const koreanTyping = new KoreanTyping();