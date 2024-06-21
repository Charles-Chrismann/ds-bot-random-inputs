function toArrayBuffer(buffer: Buffer) {
  const arrayBuffer = new ArrayBuffer(buffer.length);
  const view = new Uint8Array(arrayBuffer);
  for (let i = 0; i < buffer.length; ++i) {
    view[i] = buffer[i];
  }
  return arrayBuffer;
}

function encode (input: Uint8Array) {
  var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  var output = "";
  var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
  var i = 0;

  while (i < input.length) {
      chr1 = input[i++];
      chr2 = i < input.length ? input[i++] : Number.NaN; // Not sure if the index 
      chr3 = i < input.length ? input[i++] : Number.NaN; // checks are needed here

      enc1 = chr1 >> 2;
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
      enc4 = chr3 & 63;

      if (isNaN(chr2)) {
          enc3 = enc4 = 64;
      } else if (isNaN(chr3)) {
          enc4 = 64;
      }
      output += keyStr.charAt(enc1) + keyStr.charAt(enc2) +
                keyStr.charAt(enc3) + keyStr.charAt(enc4);
  }
  return output;
}

function dataURItoBlob(dataURI: string) {
  let byteString;
  if (dataURI.split(',')[0].indexOf('base64') >= 0)
    byteString = atob(dataURI.split(',')[1]);
  else
    byteString = unescape(dataURI.split(',')[1]);

  let mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

  let ia = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
  }

  return new Blob([ia], {type:mimeString});
}

function formatDate() {
  const now = new Date(Date.now());

  const day = String(now.getDate()).padStart(2, '0');
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[now.getMonth()];
  const year = now.getFullYear();

  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  const timezoneOffset = now.getTimezoneOffset();
  const offsetHours = String(Math.abs(Math.floor(timezoneOffset / 60))).padStart(2, '0');
  const offsetMinutes = String(Math.abs(timezoneOffset % 60)).padStart(2, '0');
  const offsetSign = timezoneOffset > 0 ? '-' : '+';

  const timezone = `${offsetSign}${offsetHours}${offsetMinutes}`;

  const formattedDate = `${day}/${month}/${year}:${hours}:${minutes}:${seconds} ${timezone}`;
  
  return formattedDate;
}

function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}



function computeFrameDiff(currentFrame: number[], newFrame: number[]) {
  // const hexArray = [] as ((string | (number  | number[]))[])[]
  const hexArray = [] as (string | (number | number[])[])[]
  for(let i = 0; i < currentFrame.length; i += 4) {
    if(
      currentFrame[i] !== newFrame[i]
      || currentFrame[i+1] !== newFrame[i+1]
      || currentFrame[i+2] !== newFrame[i+2]
    ) {
      const index = hexArray.findIndex(v => v === rgbToHex(newFrame[i], newFrame[i + 1], newFrame[i + 2]))
      // la couleur existe
      if(index !== -1) {
        // a : tableau compress
        const a = hexArray[index + 1] as (number | number[])[];
        // le dernier elemenet du tableau est une array
        if(Array.isArray(a[a.length - 1])) {
          const lastElArray = a[a.length - 1]  as number[]
          if(lastElArray[0] + 4 + lastElArray[1] * 4 === i) lastElArray[1] = lastElArray[1] + 1
          else a.push(i)
        } else {
          const lastElNumber = a[a.length - 1]  as number
          if(lastElNumber === i - 4) a[a.length - 1] = [lastElNumber, 1]
          else a.push(i)
        }
        // if(a.length === 1) {
        //   a.push(1)
        // } else a[1] = a[1] + 1
        // console.log(a)
        // if(typeof a === "number") {
        //   hexArray[index + 1] = [a, 2]
        // } else if(Array.isArray(a) && typeof a[1] === "number") a[1] = a[1] + 1
        // (hexArray[index + 1] as number[]).push(i)
      } else {
        hexArray.push(rgbToHex(newFrame[i], newFrame[i + 1], newFrame[i + 2]), [i])
      }
    }
    // console.log(hexArray)
  }

  return hexArray
}

function rgbToHex(r: number, g: number, b: number) {
  return "" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function componentToHex(c: number) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function hexToRgb(hex: string) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

export {
  toArrayBuffer,
  encode,
  dataURItoBlob,
  formatDate,
  getRandomInt,
  computeFrameDiff
}