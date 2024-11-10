const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

const port = new SerialPort({ path: 'COM6', baudRate: 9600 });  // COM 포트를 아두이노에 맞게 설정하세요
const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

const storedCode = "294748";  // 미리 저장된 코드 (예시)

parser.on('data', (data) => {
  const receivedCode = data.replace(/\s+/g, '');  // 공백 제거
  const match = receivedCode.match(/\d{6}/);  // 6자리 숫자만 추출

  if (match) {
    const extractedCode = match[0];  // 매칭된 6자리 숫자
    console.log(`Extracted code: ${extractedCode}`);

    if (extractedCode === storedCode) {
      console.log("문이 열렸습니다.");
    } else {
      console.log("암호가 틀렸습니다.");
    }
  }
  // 6자리 숫자가 없으면 아무 작업도 수행하지 않음
});

port.on('error', (err) => {
  console.error("Error: ", err.message);
});
