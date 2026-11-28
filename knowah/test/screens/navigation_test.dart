// Flutter's ready-made building blocks
import 'package:material_ui/material_ui.dart';

// testWidgets lets us test a screen without opening the app
import 'package:flutter_test/flutter_test.dart';

// Drift's in memory database, for tests
import 'package:drift/native.dart';

// The database, the Project we save into it, and the two screens we move between
import 'package:knowah/database/app_db.dart';
import 'package:knowah/models/project.dart';
import 'package:knowah/screens/menu_screen.dart';
import 'package:knowah/screens/item_list_screen.dart';

void main() {
    // TC06: clicking a recent project on the Menu opens the Item list
    testWidgets('TC06: Clicking a recent project opens the Item list', (tester) async {
        // A fresh, empty database, with one project saved into it
        final database = AppDB(NativeDatabase.memory());
        await tester.runAsync(() => database.saveProject(Project(name: 'Side-Scroller')));

        // Draw the Menu inside a minimal app, passing it the database
        await tester.pumpWidget(MaterialApp(home: MenuScreen(database: database)));

        // Wait for the Menu to load its projects, then redraw
        await tester.runAsync(() => Future.delayed(const Duration(milliseconds: 100)));
        await tester.pump();


        // Before clicking, the Item list should not be on screen
        expect(find.byType(ItemListScreen), findsNothing);

        // tester.tap pretends to press the button
        await tester.tap(find.text('Side-Scroller'));

        // pumpAndSettle waits for the screen change animation to finish
        await tester.pumpAndSettle();

        // Now the Item list should be on screen
        expect(find.byType(ItemListScreen), findsOneWidget);

        // Close the database
        await tester.runAsync(() => database.close());
    });

    // TC07: the Back button on the Item list returns to the Menu
    testWidgets('TC07: Back button returns to the Menu', (tester) async {
        // A fresh, empty database, with one project saved into it
        final database = AppDB(NativeDatabase.memory());
        await tester.runAsync(() => database.saveProject(Project(name: 'Side-Scroller')));

        // Wait for the Menu to load its projects, then redraw
        await tester.pumpWidget(MaterialApp(home: MenuScreen(database: database)));
        await tester.runAsync(() => Future.delayed(const Duration(milliseconds: 100)));
        await tester.pump();

        // Go to the Item list
        await tester.tap(find.text('Side-Scroller'));
        await tester.pumpAndSettle();

        // The Item list should be showing now
        expect(find.byType(ItemListScreen), findsOneWidget);

        // Press the Back button
        await tester.tap(find.text('Back'));
        await tester.pumpAndSettle();

        // The Item list should be gone and the Menu should be showing again
        expect(find.byType(ItemListScreen), findsNothing);
        expect(find.byType(MenuScreen), findsOneWidget);

        // Close the database
        await tester.runAsync(() => database.close());
    });
}