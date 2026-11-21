# KNOWAH Test Log

## TC01: Empty title is rejected
- Type: Unit
- Category: Input
- Test file: test/models/item_test.dart
- Expected: creating an Item with an empty title throws an error
- Failed first (Red): A1-item-red
- Passes now (Green): A2-item-green

## TC02: Title over 80 characters is rejected
- Type: Unit
- Category: Input
- Test file: test/models/item_test.dart
- Expected: creating an Item with a title over 80 characters throws an error
- Failed first (Red): A1-item-red
- Passes now (Green): A2-item-green

## TC03: Menu shows the 2 project buttons
- Type: Acceptance
- Category: Visual
- Test file: test/screens/menu_screen_test.dart
- Expected: the Menu screen shows '+ New Project' and 'Open Project'
- Failed first (Red): A3-menu-red
- Passes now (Green): A4-menu-green

## TC04: Earlier tests still pass after the Menu layout change
- Type: Regression
- Category: System Status
- Test file: all files in test/
- Expected: every earlier test still passes after each change
- Run 1: after the menu layout change, TC01 to TC03 pass (A5-regression)
- Run 2: after adding Item list screen, TC01 to TC03 and TC05 pass (A8-regression)
- Run 3: after adding navigation, TC01 to TC03, TC05 and TC06 pass (A11-regression)
- Run 4: after adding the Back button, TC01 to TC03 and TC05 to TC07 pass (A14-regression)
- Run 5: after adding the details panel, TC01 to TC03, and TC05 to TC08 all pass (A17-regression)
- Run 6: after adding Item status, TC01 to TC03, and TC05 to TC09 all pass (A20-regression)
- Run 7: after adding the status row, TC01 to TC03, and TC05 to T10 all pass (A23-regression)
- Run 8: after the Text3D refactor, TC01 to TC03, and TC05 to TC10 all pass (A24-refactor)
- Run 9: after the details panel refactor, TC01 to TC03, and TC05 to TC10 all pass (A25-refactor)
- Run 10: after adding the sidebar and the divider line, TC01 to TC03, and TC05 to TC11 all pass (A28-regression)
- Run 11: after wrapping the Item list in the side sidebar, TC01 to TC03, and TC05 to TC11 all pass (A29-regression)
- Run 12: after adding the mobile bottom bar, TC01 to TC03, and TC05 to TC12 all pass (A32-regression)
- Run 13: after adding the details screen for narrow windows, TC01 to TC03, and TC05 to TC13 all pass (A35-regression)
- Run 14: after adding the status box to the details panel, TC01 to TC03, and TC05 to TC14 all pass (A38-regression)
- Repeat after each new screen or feature

## Refactors: Third step of Red, Green, Refactor
- Refactor 1: Menu split into PC and mobile layouts (checked by regression Run 1, A5-regression)
- Refactor 2: Button3D, Panel3D and AppColours pulled out into shared files (no separate screenshot, covered by later regression runs)
- Refactor 3: Text3D so the 3D edge follows the text colour (checked by regression Run 8, A24-refactor)
- Refactor 4: Details panel split into a heading plus separate boxes (checked by regression Run 9, A25-refactor)
- Refactor 5: Dividual line between the list and details panel (checked by regression Run 10, A28-regression)

## TC05: Item list shows the title of each item
- Type: Acceptance
- Category: Visual
- Test file: test/screens/item_list_screen_test.dart
- Expected: the Item list screen shows the title of every item it is given
- Failed first (Red): A6-itemlist-red
- Passes now (Green): A7-itemlist-green

## TC06: Tapping a recent project button opens the Item list
- Type: Acceptance
- Category: Input
- Test file: test/screens/navigation_test.dart
- Expected: tapping 'Side-Scroller' on the Menu shows the Item list screen
- Failed first (Red): A9-nav-red
- Passes now (Green): A10-nav-green

## TC07: Back button returns to the Menu
- Type: Acceptance
- Category: Input
- Test file: test/screens/navigation_test.dart
- Expected: pressing 'Back' on the Item list shows the Menu again
- Failed first (Red): A12-back-red
- Passes now (Green): A13-back-green

## TC08: Tapping an item shows it in the details panel
- Type: Acceptance
- Category: Visual
- Test file: test/screens/item_list_screen_test.dart
- Expected: on a wide window, tapping an item shows its title in the details panel
- Failed first (Red): A15-details-red
- Passes now (Green): A16-details-green

## TC09: Item status defaults to Draft and can be set
- Type: Unit
- Category: Input
- Test file: test/models/item_test.dart
- Expected: a new Item is Draft unless another status is given
- Failed first (Red): A18-status-red
- Passes now (Green): A19-status-green

## TC10: Item list shows the status of each item
- Type: Acceptance
- Category: Visual
- Test file: test/screens/item_list_screen_test.dart
- Expected: each row shows its item's status (for example Active or Draft)
- Failed first (Red): A21-status-row-red
- Passes now (Green): A22-status-row-green

## TC11: Wide window shows the sidebar menu
- Type: Acceptance
- Category: Visual
- Test file: test/widgets/app_shell_test.dart
- Expected: on a wide window, a sidebar shows Dashboard, Items, Board, Searches and Export
- Failed first (Red): A26-sidebar-red
- Passes now (Green): A27-sidebar-green

## TC12: Narrow window shows the bottom menu bar
- Type: Acceptance
- Category: Visual
- Test file: test/widgets/app_shell_test.dart
- Expected: on a narrow window, a bottom bar shows Home, Items, Board, Saved and Export
- Failed first (Red): A30-bottom-bar-red
- Passes now (Green): A31-bottom-bar-green

## TC13: Tapping an item on a narrow window opens its details
- Type: Acceptance
- Category: Input
- Test file: test/screens/item_list_screen_test.dart
- Expected: on a narrow window, tapping an item opens a details screen showing that item
- Failed first (Red): A33-details-screen-red
- Passes now (Green): A34-details-screen-green

## TC14: Details panel shows the status of the selected item
- Type: Acceptance
- Category: Visual
- Test file: test/screens/item_list_screen_test.dart
- Expected: tapping an item shows its status in the details panel
- Failed first (Red): A36-details-status-red
- Passes now (Green): A37-details-status-green

## TC15: Link keeps its type and items, and rejects linking an item to itself
- Type: Unit
- Category: Input
- Test file: test/models/link_test.dart
- Expected: a Link holds its type, from item and to item, and throws an error if both items are the same
- Failed first (Red): A39-link-red
- Passes now (Green): (not built yet)