/**
 * Data Migration Script: Recalculate Customer Revenue Excluding Cancelled Bookings
 * 
 * This script fixes the bug where cancelled bookings were incorrectly included 
 * in customer totalSpent calculations. It recalculates all existing customer 
 * revenue totals to exclude cancelled bookings.
 * 
 * Run with: npx tsx scripts/migrate-customer-revenue.ts
 */

import connectDB from '../lib/mongodb';
import { Booking, Customer } from '../models';
import type { IBooking } from '../models/Booking';

async function migrateCustomerRevenue() {
  try {
    console.log('🚀 Starting customer revenue migration...');
    
    // Connect to database
    await connectDB();
    console.log('✅ Connected to database');

    // Get all customers with existing stats
    const customers = await Customer.find({ totalSpent: { $gt: 0 } });
    console.log(`📊 Found ${customers.length} customers with revenue data to migrate`);

    let migratedCustomers = 0;
    let totalRevenueBefore = 0;
    let totalRevenueAfter = 0;

    for (const customer of customers) {
      const clerkUserId = customer.clerkUserId;
      const oldTotalSpent = customer.totalSpent;
      totalRevenueBefore += oldTotalSpent;

      // Get all bookings for this customer
      const customerBookings = await Booking.find({ customer: clerkUserId });
      
      // Filter out cancelled bookings for revenue calculations
      const validBookings = customerBookings.filter(
        (booking: IBooking) => booking.status !== 'cancelled'
      );

      // Calculate corrected statistics
      const totalBookings = customerBookings.length; // Include all bookings for count
      const newTotalSpent = validBookings.reduce(
        (sum: number, booking: IBooking) => sum + (booking.totalPrice || 0),
        0
      );
      const completedBookings = customerBookings.filter(
        (booking: IBooking) => booking.status === 'checked-out'
      ).length;

      // Find the most recent booking
      const sortedBookings = customerBookings.sort(
        (a: IBooking, b: IBooking) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      const lastBookingDate =
        sortedBookings.length > 0 ? sortedBookings[0].createdAt : null;

      // Update customer record with corrected totals
      await Customer.findOneAndUpdate(
        { clerkUserId },
        {
          totalBookings,
          totalSpent: newTotalSpent,
          lastBookingDate,
        },
        { new: true }
      );

      totalRevenueAfter += newTotalSpent;
      migratedCustomers++;

      // Log significant changes
      const revenueDifference = oldTotalSpent - newTotalSpent;
      if (revenueDifference > 0) {
        console.log(`💰 Customer ${clerkUserId}: Revenue reduced by $${revenueDifference} (${oldTotalSpent} → ${newTotalSpent})`);
      }
    }

    const totalRevenueDifference = totalRevenueBefore - totalRevenueAfter;

    console.log('\n📈 Migration Summary:');
    console.log(`✅ Migrated ${migratedCustomers} customers`);
    console.log(`💵 Total revenue before: $${totalRevenueBefore.toFixed(2)}`);
    console.log(`💵 Total revenue after: $${totalRevenueAfter.toFixed(2)}`);
    console.log(`📉 Total cancelled revenue excluded: $${totalRevenueDifference.toFixed(2)}`);

    // Verify the migration by checking for any remaining inconsistencies
    console.log('\n🔍 Verifying migration...');
    const verificationResults = await Customer.aggregate([
      {
        $lookup: {
          from: 'bookings',
          localField: 'clerkUserId',
          foreignField: 'customer',
          as: 'allBookings'
        }
      },
      {
        $addFields: {
          validBookings: {
            $filter: {
              input: '$allBookings',
              as: 'booking',
              cond: { $ne: ['$$booking.status', 'cancelled'] }
            }
          }
        }
      },
      {
        $addFields: {
          calculatedTotalSpent: {
            $sum: {
              $map: {
                input: '$validBookings',
                as: 'booking',
                in: { $ifNull: ['$$booking.totalPrice', 0] }
              }
            }
          },
          revenueMismatch: {
            $ne: ['$totalSpent', {
              $sum: {
                $map: {
                  input: '$validBookings',
                  as: 'booking',
                  in: { $ifNull: ['$$booking.totalPrice', 0] }
                }
              }
            }]
          }
        }
      },
      {
        $match: {
          revenueMismatch: true
        }
      },
      {
        $project: {
          clerkUserId: 1,
          storedTotalSpent: '$totalSpent',
          calculatedTotalSpent: 1,
          difference: {
            $subtract: ['$totalSpent', '$calculatedTotalSpent']
          }
        }
      }
    ]);

    if (verificationResults.length === 0) {
      console.log('✅ All customer revenue calculations are now correct!');
    } else {
      console.log(`⚠️  Found ${verificationResults.length} customers with remaining inconsistencies:`);
      verificationResults.forEach(result => {
        console.log(`   Customer ${result.clerkUserId}: Stored=$${result.storedTotalSpent}, Calculated=$${result.calculatedTotalSpent}, Difference=$${result.difference}`);
      });
    }

    console.log('\n🎉 Customer revenue migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during migration:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run the migration
migrateCustomerRevenue();