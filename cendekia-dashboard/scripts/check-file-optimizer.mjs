// Builds a local, ignored harness to test real image encoding and bounded decoding.
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const directory='.verify-cms/file-optimizer';mkdirSync(directory,{recursive:true});
writeFileSync(directory+'/Check.csproj',`<Project Sdk="Microsoft.NET.Sdk"><PropertyGroup><OutputType>Exe</OutputType><TargetFramework>net8.0</TargetFramework><ImplicitUsings>enable</ImplicitUsings><Nullable>enable</Nullable></PropertyGroup><ItemGroup><ProjectReference Include="../../Backend/Cendekia.Persistence/Cendekia.Persistence.csproj" /></ItemGroup></Project>`);
writeFileSync(directory+'/Program.cs',String.raw`
using System.Buffers.Binary;
using System.Text.Json;
using Cendekia.Domain.School;
using Cendekia.Persistence.Services.Shared;
using SkiaSharp;

static void Check(bool value,string message) { if (!value) throw new Exception(message); }
static byte[] Encode(SKBitmap bitmap,SKEncodedImageFormat format,int quality) { using var image=SKImage.FromBitmap(bitmap);using var data=image.Encode(format,quality);return data.ToArray(); }
using var optimizer=new RegistrationFileOptimizer();
var pdf=new PaymentProofFile("application/pdf","%PDF-1.4 original signed document"u8.ToArray());
Check(ReferenceEquals(await optimizer.OptimizeAsync(pdf),pdf),"PDF content must remain untouched");
using var tiny=new SKBitmap(16,16);using(var canvas=new SKCanvas(tiny)){canvas.Clear(SKColors.White);}
var png=new PaymentProofFile("image/png",Encode(tiny,SKEncodedImageFormat.Png,100));
var small=await optimizer.OptimizeAsync(png);Check(small is not null && small.Content.SequenceEqual(png.Content),"Tiny PNG must not grow");
File.WriteAllBytes(".verify-cms/file-optimizer/valid-tiny.png",png.Content);
var jpeg=new PaymentProofFile("image/jpeg",Encode(tiny,SKEncodedImageFormat.Jpeg,90));
File.WriteAllBytes(".verify-cms/file-optimizer/valid-tiny.jpg",jpeg.Content);
using var paper=new SKBitmap(1600,2800);
var random=new Random(314);var pixels=new SKColor[1600*2800];for(int i=0;i<pixels.Length;i++){byte shade=(byte)(242+random.Next(3));pixels[i]=new SKColor(shade,shade,shade);}paper.Pixels=pixels;
using(var canvas=new SKCanvas(paper)){
 using var paint=new SKPaint{Color=SKColors.Black,IsAntialias=true};using var font=new SKFont(SKTypeface.Default,38);
 canvas.DrawText("BUKTI TRANSFER - CONTOH",80,120,SKTextAlign.Left,font,paint);
 for(int line=0;line<22;line++)canvas.DrawText(line%3==0?"Nama pengirim: Wali Siswa":line%3==1?"Nominal: Rp 350.000":"Tanggal: 08 November 2026",80,240+line*100,SKTextAlign.Left,font,paint);
}
var original=new PaymentProofFile("image/jpeg",Encode(paper,SKEncodedImageFormat.Jpeg,95));
Check(original.Content.Length<=1048576,"Image fixture must fit upload size limit");
File.WriteAllBytes(".verify-cms/file-optimizer/proof-large.jpg",original.Content);
var optimized=await optimizer.OptimizeAsync(original);Check(optimized is not null,"Valid JPEG must optimize");
Check(optimized!.Content.Length<original.Content.Length*0.7,"Large JPEG should shrink materially");
using var decoded=SKBitmap.Decode(optimized.Content);Check(decoded is not null && Math.Max(decoded.Width,decoded.Height)<=2400,"Optimized file must decode and fit maximum edge");
File.WriteAllBytes(".verify-cms/file-optimizer/proof-optimized.jpg",optimized.Content);
// EXIF RightTop (orientation=6) must survive as correctly oriented pixels.
var exif=new byte[]{255,225,0,34,69,120,105,102,0,0,73,73,42,0,8,0,0,0,1,0,18,1,3,0,1,0,0,0,6,0,0,0,0,0,0,0};
var rotated=original.Content[..2].Concat(exif).Concat(original.Content[2..]).ToArray();
using(var data=SKData.CreateCopy(rotated))using(var codec=SKCodec.Create(data)){Check(codec.EncodedOrigin==SKEncodedOrigin.RightTop,"EXIF fixture must be portrait-rotated");}
var rotatedResult=await optimizer.OptimizeAsync(new PaymentProofFile("image/jpeg",rotated));using(var image=SKBitmap.Decode(rotatedResult!.Content)){Check(image.Width>image.Height,"EXIF orientation must be applied to output pixels");}
Check(await optimizer.OptimizeAsync(new PaymentProofFile("image/jpeg",new byte[]{255,216,255,224,0,16,74,70,73,70,0,255,217})) is null,"Fake JPEG headers must be rejected");
// A tiny encoded PNG declaring enormous dimensions must be rejected before pixel allocation.
var huge=png.Content.ToArray();BinaryPrimitives.WriteUInt32BigEndian(huge.AsSpan(16,4),20000);BinaryPrimitives.WriteUInt32BigEndian(huge.AsSpan(20,4),20000);
uint crc=0xffffffff;for(int i=12;i<29;i++){crc^=huge[i];for(int bit=0;bit<8;bit++)crc=(crc&1)!=0?(crc>>1)^0xedb88320:crc>>1;}BinaryPrimitives.WriteUInt32BigEndian(huge.AsSpan(29,4),crc^0xffffffff);
Check(await optimizer.OptimizeAsync(new PaymentProofFile("image/png",huge)) is null,"Huge dimensions must be rejected without decoding");
await Task.WhenAll(Enumerable.Range(0,3).Select(_=>Task.Run(async()=>{var result=await optimizer.OptimizeAsync(original);Check(result!.Content.Length==optimized.Content.Length,"Concurrent optimizations must remain deterministic");})));
using var canceled=new CancellationTokenSource();canceled.Cancel();try{await optimizer.OptimizeAsync(original,canceled.Token);throw new Exception("Canceled optimization ran");}catch(OperationCanceledException){}
Console.WriteLine(JsonSerializer.Serialize(new {inputBytes=original.Content.Length,storedBytes=optimized.Content.Length,savedPercent=Math.Round(100.0*(original.Content.Length-optimized.Content.Length)/original.Content.Length,1),width=decoded!.Width,height=decoded.Height}));
Console.WriteLine("PASS: real JPEG compression, small PNG preservation, EXIF rotation, untouched PDF, invalid and oversized image rejection, concurrency, and cancellation.");
`);
const result=spawnSync('dotnet',['run','--project',directory+'/Check.csproj','--no-launch-profile'],{encoding:'utf8',windowsHide:true,timeout:180000});
process.stdout.write(result.stdout || '');if(result.stderr)process.stderr.write(result.stderr);assert.equal(result.status,0,'Image optimizer checks failed');
