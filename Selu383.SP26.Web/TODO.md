# General notes
- Figure out how to store images in backend and allow for menu items to be created by admins, alongside custom photos for user profiles
- Integrate different tax amounts for different locations (NY tax rate is different than LA's) [This could also potentially be handled by location services]
- Disable unrealistic payment methods
- Implement a library that generates a QR code for orders
- Admin page where users, loyalty points, menu items, etc can be managed - this is okay to be on web-only
- Implement on-device location services for ordering

# Done
- [x] Margins/padding is too thin horizontally on the Navbar buttons — increased to 8px/16px
- [x] Overall sitewide corner sizes need to be consistent — Mantine defaultRadius: 'md' applied globally
- [x] Modal popups for each menu item when clicked feel a little tight — more padding added globally
- [x] Extra components on the home landing page are too much — removed promo cards, condensed to single viewport
- [x] Home screen needs a total rework — new liquid glass hero, animated gradient blobs, no scroll
- [x] Sitewide visual overhaul — glass cards, glass navbar, glass modals/drawer, animated background, button glow effects
