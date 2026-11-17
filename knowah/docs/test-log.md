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
- Expected creating an Item with a title over 80 characters throws an error
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
- Repeat after each new screen or feature

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