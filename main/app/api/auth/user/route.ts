import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/app/_middleware/mongodb';
import { User } from '@/app/_models/schema';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Connect to MongoDB
        await connectToDatabase();

        const userData = await request.json();
        
        // Validate required fields
        if (!userData.githubId) {
            return NextResponse.json(
                { error: 'githubId is required' },
                { status: 400 }
            );
        }

        // Check if user already exists
        let user = await User.findOne({ githubId: userData.githubId });

        if (user) {
            // Update existing user's information
            user.name = userData.name || user.name;
            user.email = userData.email || user.email;
            user.image = userData.image || user.image;
            await user.save();
            return NextResponse.json({ user, message: 'User updated successfully' });
        }

        // Create new user
        user = await User.create({
            githubId: userData.githubId,
            name: userData.name || 'GitHub User',
            email: userData.email || `${userData.githubId}@github.com`,
            image: userData.image || '',
        });

        return NextResponse.json({ user, message: 'User created successfully' });

    } catch (error: any) {
        console.error('Error in user route:', error);
        
        // Send more specific error messages
        if (error.name === 'ValidationError') {
            return NextResponse.json(
                { error: 'Validation Error', details: error.message },
                { status: 400 }
            );
        }
        
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}