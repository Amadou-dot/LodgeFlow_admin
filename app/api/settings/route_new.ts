import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import { Settings } from '../../../models';

export async function GET() {
  try {
    await connectDB();
    
    // Get settings or create default if none exist
    let settings = await Settings.findOne();
    
    if (!settings) {
      // Create default settings if none exist
      settings = await Settings.create({});
    }
    
    return NextResponse.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch settings' 
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Get current settings or create new if none exist
    let settings = await Settings.findOne();
    
    if (settings) {
      // Update existing settings
      Object.assign(settings, body);
      await settings.save();
    } else {
      // Create new settings
      settings = await Settings.create(body);
    }
    
    return NextResponse.json({
      success: true,
      data: settings
    });
  } catch (error: any) {
    console.error('Error updating settings:', error);
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          details: error.errors
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update settings' 
      },
      { status: 500 }
    );
  }
}
