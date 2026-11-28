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
- Run 15: after adding the Link model, TC01 to TC03 and TC05 to TC15 all pass (A41-regression)
- Run 16: after showing links in the details panel, TC01 to TC03 and TC05 to TC16 all pass (A44-regression)
- Run 17: after adding status and links to the narrow details screen, TC01 to TC03 and TC05 to TC17 all pass (A47-regression)
- Run 18: after adding Item IDs, TC01 to TC03 and TC05 to TC18 all pass (A50-regression)
- Run 19: after adding Item dates, TC01 to TC03 and TC05 to TC19 all pass (A53-regression)
- Run 20: end of the Project and database group, TC01 to TC03 and TC05 to TC25 all pass (A58-regression)
- Run 21: after the Menu started loading projects from the database, TC03, TC06 and TC07 stopped compiling (A61-regression-fail) and were updated to give the Menu a database, all tests now pass (A62-regression)
- Run 22: end of the Menu and projects group, TC01 to TC03 and TC05 to TC28 all pass (A68-regression)
- Run 23: after restyling the New Project pop up, TC01 to TC03 and TC05 to TC28 all pass (A69-refactor)
- Repeat after each new screen or feature

## Refactors: Third step of Red, Green, Refactor
- Refactor 1: Menu split into PC and mobile layouts (checked by regression Run 1, A5-regression)
- Refactor 2: Button3D, Panel3D and AppColours pulled out into shared files (no separate screenshot, covered by later regression runs)
- Refactor 3: Text3D so the 3D edge follows the text colour (checked by regression Run 8, A24-refactor)
- Refactor 4: Details panel split into a heading plus separate boxes (checked by regression Run 9, A25-refactor)
- Refactor 5: Dividual line between the list and details panel (checked by regression Run 10, A28-regression)
- Refactor 6: Sidebar logo centred (checked by regression Run 11, A29-regression)
- Refactor 7: Detail boxes moved into one shared widget used by the side panel and the details screen (checked by regression Run 17, A47-regression)
- Refactor 8: New Project pop up restyled with Panel3D, Button3D and Text3D to match the rest of the app (checked by regression Run 23, A69-refactor)

## Manual Check: Projects survive closing and reopening the app
- Type: Acceptance
- Steps: create a project, stop the app, run it again
- Result: the project is still in the recent list (A65-perist)

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
- Passes now (Green): A40-link-green

## TC16: Details panel shows the links of the selected item
- Type: Acceptance
- Category: Visual
- Test file: test/models/item_list_screen_test.dart
- Expected: tapping an item shows its links in the details panel, for example: 'Introduced In → Level 2'
- Failed first (Red): A42-links-red
- Passes now (Green): A43-links-green

## TC17: Narrow details screen shows the status and links
- Type: Acceptance
- Category: Visual
- Test file: test/models/item_list_screen_test.dart
- Expected: on a narrow window, the details screen shows the item's status and its links
- Failed first (Red): A45-links-screen-red
- Passes now (Green): A46-links-screen-green

## TC18: Items get unique IDs, and a given ID is kept
- Type: Unit
- Category: Input
- Test file: test/models/item_test.dart
- Expected: every new Item gets a non-empty ID that no other item shares, and an ID passed in is kept
- Failed first (Red): A48-id-red
- Passes now (Green): A49-id-green

## TC19: Items record when they are created and edited
- Type: Unit
- Category: Input
- Test file: test/models/item_test.dart
- Expected: a new Item gets a created time and an edited time that match, and any dates passed in are kept
- Failed first (Red): A51-dates-red
- Passes now (Green): A52-dates-green

## TC20: Project with an empty name is rejected
- Type: Unit
- Category: Input
- Test file: test/models/project_test.dart
- Expected: creating a Project with an empty name throws an error
- Failed first (Red): A54-project-red
- Passes now (Green): A55-project-green

## TC21: Project name over 80 characters is rejected
- Type: Unit
- Category: Input
- Test file: test/models/project_test.dart
- Expected: creating a Project with a name over 80 characters throws an error
- Failed first (Red): A54-project-red
- Passes now (Green): A55-project-green

## TC22: Projects get unique IDs, and a give ID is kept
- Type: Unit
- Category: Input
- Test file: test/models/project_test.dart
- Expected: every new Project gets a non-empty ID that no other project shares, and an ID passed in is kept
- Failed first (Red): A54-project-red
- Passes now (Green): A55-project-green

## TC23: A saved project can be found again
- Type: Unit
- Category: System Status
- Test file: test/database/project_db_test.dart
- Expected: after saving a project to the database, it appears in the list of all projects and can be fetched by its ID
- Failed first (Red): A56-database-red
- Passes now (Green): A57-database-green

## TC24: Saving a project with an existing ID replaces it
- Type: Unit
- Category: System Status
- Test file: test/database/project_db_test.dart
- Expected: saving a project whose ID is already stored replaces the old one, with no duplicate
- Failed first (Red): A56-database-red
- Passes now (Green): A57-database-green

## TC25: A deleted project is gone
- Type: Unit
- Category: System Status
- Test file: test/database/project_db_test.dart
- Expected: after deleting a project by ID, it no longer appears in the list of all projects
- Failed first (Red): A56-database-red
- Passes now (Green): A57-database-green

## TC26: Recent projects on the Menu come from the database
- Type: Acceptance
- Category: Visual
- Test file: test/screens/menu_recent_projects_test.dart
- Expected: projects saved in the database appear as the recent projects on the Menu
- Failed first (Red): A59-menu-db-red
- Passes now (Green): A60-menu-db-green

## TC27: Creating a new project adds it to the recent projects
- Type: Acceptance
- Category: Input
- Test file: test/screens/menu_new_project_test.dart
- Expected: pressing + New Project, typing a name and pressing Create saves the project, and it appears in the recent projects
- Failed first (Red): A63-new-project-red
- Passes now (Green): A64-new-project-green

## TC28: An empty project name shows a message and saves nothing
- Type: Acceptance
- Category: Input
- Test file: test/screens/menu_new_project_test.dart
- Expected: pressing Create with an empty name shows 'Name cannot be empty', keeps the pop up open and saves nothing
- Failed first (Red): A66-empty-name-red
- Passes now (Green): A67-empty-name-green

## TC29: Item keeps the project ID it is given
- Type: Unit
- Category: Input
- Test file: test/models/item_test.dart
- Expected: an Item created wtih a project ID returns that same project ID
- Failed first (Red): A70-item-project-red
- Passes now (Green): A71-item-project-green

## TC30: An item saves to teh database and loads again, an an item without a project is refused
- Type: Unit
- Category: System Status
- Test file: test/database/item_db_test.dart
- Expected: a saved item comes back with the same ID, title, status and project ID, and saving an item with no project throws an error
- Failed first (Red): A72-item-db-red
- Passes now (Green): A73-item-db-green