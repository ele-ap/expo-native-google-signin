require 'json'

package = JSON.parse(File.read(File.join(__dir__, '..', 'package.json')))

Pod::Spec.new do |s|
  s.name           = 'ExpoNativeGoogleSignIn'
  s.version        = package['version']
  s.summary        = package['description']
  s.description    = package['description']
  s.license        = package['license']
  s.author         = package['author']
  s.homepage       = package['homepage']
  s.platforms      = {
    :ios => '15.1'
  }
  s.swift_version  = '5.9'
  s.source         = { git: package['repository']['url'], tag: "v#{s.version}" }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'
  s.dependency 'GoogleSignIn', '~> 9.2'
  # GoogleSignIn -> AppCheckCore (a Swift pod to CocoaPods: it declares a swift_version) depends on these two pods, which don't define modules,
  # so `pod install` fails under the default static-library Podfile. Expo autolinking enables modular
  # headers for the direct dependencies of a module, so listing them here fixes it without any
  # consumer Podfile changes. Unversioned: AppCheckCore's own constraints pick the versions.
  s.dependency 'GoogleUtilities'
  s.dependency 'RecaptchaInterop'

  # Swift/Objective-C compatibility
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
