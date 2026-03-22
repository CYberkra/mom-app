import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Get the first user (assuming single user app)
    const user = await prisma.user.findFirst();
    
    if (!user) {
      // Return default settings if no user exists
      return NextResponse.json({
        success: true,
        data: {
          id: 0,
          userId: 0,
          largeFontMode: false,
          autoRead: false,
          reminderTime: "08:00",
          darkMode: false,
          notificationsEnabled: true,
          lastUpdated: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      });
    }
    
    // Parse settings JSON
    let settingsData;
    try {
      settingsData = JSON.parse(user.settings);
    } catch {
      settingsData = {
        largeFontMode: false,
        autoRead: false,
        reminderTime: "08:00",
        darkMode: false,
        notificationsEnabled: true,
      };
    }
    
    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        userId: user.id,
        ...settingsData,
        lastUpdated: user.updatedAt.toISOString(),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    
    // Validate settings
    const allowedFields = [
      "largeFontMode",
      "autoRead", 
      "reminderTime",
      "darkMode",
      "notificationsEnabled"
    ];
    
    const updates: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(body)) {
      if (allowedFields.includes(key)) {
        updates[key] = value;
      }
    }
    
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid settings to update" },
        { status: 400 }
      );
    }
    
    // Get the first user
    const user = await prisma.user.findFirst();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }
    
    // Parse current settings
    let currentSettings;
    try {
      currentSettings = JSON.parse(user.settings);
    } catch {
      currentSettings = {};
    }
    
    // Merge updates
    const newSettings = {
      ...currentSettings,
      ...updates,
    };
    
    // Update user settings
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        settings: JSON.stringify(newSettings),
        updatedAt: new Date(),
      },
    });
    
    return NextResponse.json({
      success: true,
      data: {
        id: updatedUser.id,
        userId: updatedUser.id,
        ...newSettings,
        lastUpdated: updatedUser.updatedAt.toISOString(),
      },
      message: "Settings updated successfully",
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update settings" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;
    
    // Get the first user
    const user = await prisma.user.findFirst();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }
    
    switch (action) {
      case "reset":
        // Reset to default settings
        const defaultSettings = {
          largeFontMode: false,
          autoRead: false,
          reminderTime: "08:00",
          darkMode: false,
          notificationsEnabled: true,
        };
        
        const updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: {
            settings: JSON.stringify(defaultSettings),
            updatedAt: new Date(),
          },
        });
        
        return NextResponse.json({
          success: true,
          data: {
            id: updatedUser.id,
            userId: updatedUser.id,
            ...defaultSettings,
            lastUpdated: updatedUser.updatedAt.toISOString(),
          },
          message: "Settings reset to defaults",
        });
        
      case "export":
        // Export settings
        let exportSettings;
        try {
          exportSettings = JSON.parse(user.settings);
        } catch {
          exportSettings = {};
        }
        
        return NextResponse.json({
          success: true,
          data: {
            id: user.id,
            userId: user.id,
            ...exportSettings,
            lastUpdated: user.updatedAt.toISOString(),
          },
          message: "Settings exported successfully",
        });
        
      case "import":
        // Import settings
        const importedSettings = body.settings;
        if (!importedSettings || typeof importedSettings !== "object") {
          return NextResponse.json(
            { success: false, error: "Invalid settings data" },
            { status: 400 }
          );
        }
        
        const importedUser = await prisma.user.update({
          where: { id: user.id },
          data: {
            settings: JSON.stringify(importedSettings),
            updatedAt: new Date(),
          },
        });
        
        return NextResponse.json({
          success: true,
          data: {
            id: importedUser.id,
            userId: importedUser.id,
            ...importedSettings,
            lastUpdated: importedUser.updatedAt.toISOString(),
          },
          message: "Settings imported successfully",
        });
        
      default:
        return NextResponse.json(
          { success: false, error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error processing settings action:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process settings action" },
      { status: 500 }
    );
  }
}