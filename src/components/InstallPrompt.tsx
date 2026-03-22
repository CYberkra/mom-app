"use client";

import { useState, useEffect } from "react";

export default function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if it's iOS (iPhone/iPad)
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isInStandaloneMode = window.matchMedia("(display-mode: standalone)").matches;
    
    // Only show prompt on iOS devices that haven't installed the app
    if (isIOSDevice && !isInStandaloneMode) {
      setIsIOS(true);
      
      // Check if user previously dismissed
      const dismissed = localStorage.getItem("install_prompt_dismissed");
      const visitCount = parseInt(localStorage.getItem("visit_count") || "0");
      
      // Increment visit count
      localStorage.setItem("visit_count", (visitCount + 1).toString());
      
      // Show prompt after 2nd visit, with longer delay
      if (!dismissed && visitCount >= 1) {
        const timer = setTimeout(() => {
          setShowPrompt(true);
        }, 5000); // 5 seconds delay
        
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const dismissPrompt = () => {
    setShowPrompt(false);
    // Remember that user dismissed the prompt
    localStorage.setItem("install_prompt_dismissed", "true");
  };

  // Don't show if user previously dismissed
  if (!showPrompt || !isIOS) {
    return null;
  }

  // Check if user previously dismissed
  if (typeof window !== "undefined" && localStorage.getItem("install_prompt_dismissed")) {
    return null;
  }

  return (
    <div className="fixed bottom-24 left-4 right-4 bg-white rounded-2xl shadow-xl border border-gray-100 p-5 z-50">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <span className="text-2xl mr-3">📱</span>
          <div>
            <h3 className="font-bold text-lg">添加到主屏幕</h3>
            <p className="text-gray-500 text-sm">像App一样方便使用</p>
          </div>
        </div>
        <button
          onClick={dismissPrompt}
          className="text-gray-400 hover:text-gray-600 p-1"
          aria-label="关闭提示"
        >
          ✕
        </button>
      </div>
      
      <div className="bg-gray-50 rounded-xl p-4 mb-4">
        <p className="text-gray-700 text-sm mb-3 font-medium">安装步骤：</p>
        <div className="space-y-2">
          <div className="flex items-start">
            <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3 mt-0.5">1</span>
            <p className="text-gray-600 text-sm">点击底部分享按钮 <span className="inline-block">📤</span></p>
          </div>
          <div className="flex items-start">
            <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3 mt-0.5">2</span>
            <p className="text-gray-600 text-sm">向下滑动，找到"添加到主屏幕"</p>
          </div>
          <div className="flex items-start">
            <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3 mt-0.5">3</span>
            <p className="text-gray-600 text-sm">点击"添加"即可完成安装</p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <button
          onClick={dismissPrompt}
          className="text-gray-500 text-sm"
        >
          下次再说
        </button>
        <button
          onClick={dismissPrompt}
          className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-medium"
        >
          知道了
        </button>
      </div>
    </div>
  );
}