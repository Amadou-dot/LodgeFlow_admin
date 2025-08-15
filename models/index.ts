// Export all models
export { default as Cabin, type ICabin } from "./Cabin";
export { default as Customer, type ICustomer } from "./Customer";
export { default as Booking, type IBooking } from "./Booking";
export { default as Settings, type ISettings } from "./Settings";

// Re-export database connection
export { default as connectDB } from "../lib/mongodb";
