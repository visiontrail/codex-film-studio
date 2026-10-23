import Foundation
import AVFoundation
import CoreImage
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers

let args = CommandLine.arguments
let input = URL(fileURLWithPath: args[1])
let target = URL(fileURLWithPath: args[2], isDirectory: true)
let sourceFPS = Double(args[3])!
let excerptSeconds = Int(args[4])!
let asset = AVURLAsset(url: input)
let track = asset.tracks(withMediaType:.video)[0]
let reader = try AVAssetReader(asset:asset)
let output = AVAssetReaderTrackOutput(track:track,outputSettings:[kCVPixelBufferPixelFormatTypeKey as String:kCVPixelFormatType_32BGRA])
output.alwaysCopiesSampleData=false
reader.add(output)
if !reader.startReading() { fatalError("Cannot start reader: \(String(describing:reader.error))") }
try FileManager.default.createDirectory(at:target,withIntermediateDirectories:true)
var wanted:[Int:[Int]]=[:]
for n in 0..<(excerptSeconds*24) {
    let sourceIndex=Int((Double(n)*sourceFPS/24.0).rounded())
    wanted[sourceIndex,default:[]].append(n)
}
let context=CIContext(options:[.cacheIntermediates:false])
let colourSpace=CGColorSpaceCreateDeviceRGB()
var frame=0
var saved=0
var previous:[Double]=[]
var metrics:[[String:Any]]=[]
var width=0
var height=0
var blackFrames=0
var lastPTS=0.0
while let sample=output.copyNextSampleBuffer() {
    autoreleasepool {
        let pts=CMTimeGetSeconds(CMSampleBufferGetPresentationTimeStamp(sample))
        lastPTS=pts
        guard let pixel=CMSampleBufferGetImageBuffer(sample) else {fatalError("Decoded sample missing image")}
        width=CVPixelBufferGetWidth(pixel);height=CVPixelBufferGetHeight(pixel)
        CVPixelBufferLockBaseAddress(pixel,.readOnly)
        let base=CVPixelBufferGetBaseAddress(pixel)!.assumingMemoryBound(to:UInt8.self)
        let stride=CVPixelBufferGetBytesPerRow(pixel)
        var values:[Double]=[];var sum=0.0;var dark=0
        for y in Swift.stride(from:0,to:height,by:max(1,height/90)) {
            for x in Swift.stride(from:0,to:width,by:max(1,width/160)) {
                let i=y*stride+x*4
                let v=Double(base[i])*0.0722+Double(base[i+1])*0.7152+Double(base[i+2])*0.2126
                values.append(v);sum+=v;if v<8 {dark+=1}
            }
        }
        CVPixelBufferUnlockBaseAddress(pixel,.readOnly)
        let isBlack=Double(dark)/Double(values.count)>0.98
        if isBlack {blackFrames+=1}
        var row:[String:Any]=["frame":frame,"presentationTime":pts,"meanLuma":sum/Double(values.count),"nearlyBlack":isBlack]
        if previous.count==values.count {row["meanFrameDifference"]=zip(values,previous).map{abs($0-$1)}.reduce(0,+)/Double(values.count)}
        previous=values;metrics.append(row)
        if let indices=wanted[frame] {
            let image=CIImage(cvPixelBuffer:pixel)
            let cg=context.createCGImage(image,from:image.extent)!
            let targetHeight=Int((Double(height)*960.0/Double(width)).rounded())
            let resized=CGContext(data:nil,width:960,height:targetHeight,bitsPerComponent:8,bytesPerRow:960*4,space:colourSpace,bitmapInfo:CGImageAlphaInfo.noneSkipLast.rawValue)!
            resized.interpolationQuality = .high
            resized.draw(cg,in:CGRect(x:0,y:0,width:960,height:targetHeight))
            let result=resized.makeImage()!
            for index in indices {
                let dest=CGImageDestinationCreateWithURL(target.appendingPathComponent(String(format:"%05d.jpg",index)) as CFURL,UTType.jpeg.identifier as CFString,1,nil)!
                CGImageDestinationAddImage(dest,result,[kCGImageDestinationLossyCompressionQuality:0.94] as CFDictionary)
                if !CGImageDestinationFinalize(dest) {fatalError("JPEG save failed")}
                saved+=1
            }
        }
        frame+=1
    }
}
if reader.status != .completed {fatalError("Decode did not complete: \(String(describing:reader.error))")}
if saved != excerptSeconds*24 {fatalError("Wrong excerpt count \(saved)")}
let report:[String:Any]=[
    "source":input.lastPathComponent,"decoder":"macOS AVFoundation AVAssetReader; uncompressed BGRA output; no ffmpeg process",
    "width":width,"height":height,"sourceFps":sourceFPS,"sourceFrameCount":frame,"sourceLastPresentationTime":lastPTS,
    "automatedFrameCoverage":"\(frame)/\(frame)","decoderStatus":"completed","nearlyBlackFrames":blackFrames,
    "output":["path":target.path,"pattern":"%05d.jpg","width":960,"height":Int((Double(height)*960.0/Double(width)).rounded()),"fps":24,"count":saved,"sourceStart":0,"sourceEndExclusive":excerptSeconds,"sampling":"nearest source frame to target time using ffprobe-verified stream fps; zero-based indices"],
    "frameMetrics":metrics]
let reportURL=target.deletingLastPathComponent().appendingPathComponent(target.lastPathComponent+"-all-frames.json")
try JSONSerialization.data(withJSONObject:report,options:[.prettyPrinted,.sortedKeys]).write(to:reportURL)
print("DECODE COMPLETE \(input.lastPathComponent) \(frame) source frames; \(saved) output frames; black \(blackFrames); last PTS \(lastPTS)")
