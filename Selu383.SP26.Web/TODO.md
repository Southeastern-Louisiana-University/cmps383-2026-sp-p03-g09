# General notes
- Web - menu - modal popup needs padding for the image at the top of the popup- right now the top edge hugs the top of the frame
- Navbar - horizontal padding needs to be added outside of the text inside each button
- Users should be able to select a table to reserve when placing dine-in orders.
   - Ensure that tables can't be reserved at any time in the past
	- Ensure that tables are automatically reserved when an order is placed, so that users cannot attempt to reserve a table that's already taken
- Landing page background is still a little minimal- maybe we could try a different style of animation?

# Done
- [x] Margins/padding is too thin horizontally on the Navbar buttons — increased to 8px/16px
- [x] Overall sitewide corner sizes need to be consistent — Mantine defaultRadius: 'md' applied globally
- [x] Modal popups for each menu item when clicked feel a little tight — more padding added globally
- [x] Extra components on the home landing page are too much — removed promo cards, condensed to single viewport
- [x] Home screen needs a total rework — new liquid glass hero, animated gradient blobs, no scroll
- [x] Sitewide visual overhaul — glass cards, glass navbar, glass modals/drawer, animated background, button glow effects
