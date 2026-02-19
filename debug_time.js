const time = "12:00";
const isPM = /PM$/i.test(time.trim());
console.log(`Original: ${time}, PM detected: ${isPM}`);

const parts = time.split(':');
let h = parseInt(parts[0]);
// Bug logic simulation:
if (isPM && h < 12) h += 12;
if (!isPM && h === 12) h = 0; // This makes 12:00 -> 00:00 (Midnight) instead of Noon!

const hh = h % 12 || 12;
const ampm = h < 12 ? 'AM' : 'PM';
console.log(`Result: ${hh}:${parts[1]} ${ampm}`);
