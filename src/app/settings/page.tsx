"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import Card from "@/components/Card";
import Button from "@/components/Button";

interface Settings {
  largeFontMode: boolean;
  autoRead: boolean;
  reminderTime: string;
  darkMode: boolean;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    largeFontMode: false,
    autoRead: false,
    reminderTime: "08:00",
    darkMode: false,
  });

  useEffect(() => {
    // Load settings from localStorage
    const saved = localStorage.getItem("app_settings");
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem("app_settings", JSON.stringify(newSettings));
    
    // Apply large font mode
    if (key === "largeFontMode") {
      document.documentElement.classList.toggle("large-font-mode", !!value);
    }
  };

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        alert("已开启通知权限");
      }
    }
  };

  return (
    <Layout>
      <div className="container py-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-primary">
            ⚙️ 设置
          </h1>
          <p className="text-gray-600 mt-1">
            个性化你的灵修体验
          </p>
        </div>

        {/* Display settings */}
        <Card title="显示设置" icon="📱" className="mb-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">大字模式</p>
                <p className="text-sm text-gray-500">适合视力不好的长辈</p>
              </div>
              <button
                onClick={() => updateSetting("largeFontMode", !settings.largeFontMode)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings.largeFontMode ? "bg-primary" : "bg-gray-300"
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                  settings.largeFontMode ? "translate-x-6" : "translate-x-1"
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">深色模式</p>
                <p className="text-sm text-gray-500">晚上使用更舒适</p>
              </div>
              <button
                onClick={() => updateSetting("darkMode", !settings.darkMode)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings.darkMode ? "bg-primary" : "bg-gray-300"
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                  settings.darkMode ? "translate-x-6" : "translate-x-1"
                }`} />
              </button>
            </div>
          </div>
        </Card>

        {/* Reading settings */}
        <Card title="朗读设置" icon="🔊" className="mb-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">自动朗读</p>
                <p className="text-sm text-gray-500">打开灵修内容时自动朗读</p>
              </div>
              <button
                onClick={() => updateSetting("autoRead", !settings.autoRead)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings.autoRead ? "bg-primary" : "bg-gray-300"
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                  settings.autoRead ? "translate-x-6" : "translate-x-1"
                }`} />
              </button>
            </div>
          </div>
        </Card>

        {/* Reminder settings */}
        <Card title="每日提醒" icon="⏰" className="mb-6">
          <div className="space-y-4">
            <div>
              <p className="font-medium mb-2">提醒时间</p>
              <input
                type="time"
                value={settings.reminderTime}
                onChange={(e) => updateSetting("reminderTime", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
            </div>
            
            <Button
              variant="secondary"
              onClick={requestNotificationPermission}
              fullWidth
            >
              开启通知权限
            </Button>
          </div>
        </Card>

        {/* Data management */}
        <Card title="数据管理" icon="💾" className="mb-6">
          <div className="space-y-3">
            <Button variant="secondary" fullWidth>
              导出我的数据
            </Button>
            <Button variant="secondary" fullWidth>
              导入数据
            </Button>
            <Button variant="outline" fullWidth className="text-red-600 border-red-600">
              清除所有数据
            </Button>
          </div>
        </Card>

        {/* About */}
        <Card title="关于" icon="ℹ️" className="mb-8">
          <div className="text-center">
            <p className="text-lg font-medium mb-2">妈妈灵修助手</p>
            <p className="text-sm text-gray-500 mb-4">版本 1.0.0</p>
            <p className="text-sm text-gray-600">
              为长辈提供每日灵修、经文解释、背经练习等功能。
              帮助长辈每天与神亲近，生命得更新。
            </p>
          </div>
        </Card>
      </div>
    </Layout>
  );
}