import Foundation
import AVFoundation
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers
import CoreText

let args = CommandLine.arguments
let source = URL(fileURLWithPath: args[1])
let output = URL(fileURLWithPath: args[2], isDirectory: true)
try FileManager.default.createDirectory(at: output, withIntermediateDirectories: true)
let asset = AVURLAsset(url: source)
let duration = args.count > 3 ? Double(args[3])! : CMTimeGetSeconds(asset.duration)
let generator = AVAssetImageGenerator(asset: asset)
generator.appliesPreferredTrackTransform = true
generator.requestedTimeToleranceBefore = .zero
generator.requestedTimeToleranceAfter = .zero
let colourSpace = CGColorSpaceCreateDeviceRGB()
let montage = CGContext(data: nil, width: 1440, height: 1150,
                        bitsPerComponent: 8, bytesPerRow: 1440*4,
                        space: colourSpace,
                        bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue)!
montage.setFillColor(CGColor(gray: 0.04, alpha: 1))
montage.fill(CGRect(x: 0, y: 0, width: 1440, height: 1150))
for i in 0..<20 {
    let seconds = Double(i) * max(0,duration-0.10) / 19.0
    var actual = CMTime.zero
    let image = try generator.copyCGImage(at: CMTime(seconds: seconds, preferredTimescale: 60000), actualTime: &actual)
    let url = output.appendingPathComponent(String(format:"sample-%02d.jpg",i))
    let dest = CGImageDestinationCreateWithURL(url as CFURL, UTType.jpeg.identifier as CFString, 1, nil)!
    CGImageDestinationAddImage(dest,image,[kCGImageDestinationLossyCompressionQuality:0.9] as CFDictionary)
    CGImageDestinationFinalize(dest)
    let x = (i%4)*360;let y = (4-i/4)*230
    montage.draw(image,in:CGRect(x:x,y:y+27,width:360,height:203))
    let label = String(format:"%02d / %.3fs",i,CMTimeGetSeconds(actual))
    let attr = NSAttributedString(string:label,attributes:[
        NSAttributedString.Key(kCTFontAttributeName as String):CTFontCreateWithName("Menlo" as CFString,15,nil),
        NSAttributedString.Key(kCTForegroundColorAttributeName as String):CGColor(gray:0.95,alpha:1)])
    montage.textPosition=CGPoint(x:x+8,y:y+7)
    CTLineDraw(CTLineCreateWithAttributedString(attr),montage)
}
let dest = CGImageDestinationCreateWithURL(output.appendingPathComponent("contact-sheet.jpg") as CFURL,UTType.jpeg.identifier as CFString,1,nil)!
CGImageDestinationAddImage(dest,montage.makeImage()!,[kCGImageDestinationLossyCompressionQuality:0.94] as CFDictionary)
CGImageDestinationFinalize(dest)
print("Saved 20 exact-time sample requests for \(source.lastPathComponent), duration \(duration)")
