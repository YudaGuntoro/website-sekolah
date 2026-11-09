import {randomUUID} from 'node:crypto';
export function spmbProfileFields(grade='VII') {
 return {nickname:'Panggilan Uji',religion:'Islam',medicalHistory:'',heightCm:145.5,weightKg:38.5,bloodGroup:'O',parentPhone:'081234567890',fatherName:'Ayah Uji',motherName:'Ibu Uji',fatherOccupation:'Wiraswasta',motherOccupation:'Guru',guardianOccupation:'-',parentAddress:'Alamat Orang Tua Uji',economicCondition:'Baik',dailyLanguage:'',guardianEmail:'pendaftaran@example.invalid',entryType:grade==='VII'?'Baru':'Pindahan',nisn:String(BigInt('0x'+randomUUID().replaceAll('-','').slice(0,12))%10000000000n).padStart(10,'0')};
}
