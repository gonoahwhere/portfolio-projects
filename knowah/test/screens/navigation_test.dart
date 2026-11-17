// Flutter's ready-made building blocks
import 'package:material_ui/material_ui.dart';

// testWidgets lets us test a screen without opening the app
import 'package:flutter_test/flutter_test.dart';

// The two screens to move between
import 'package:knowah/screens/menu_screen.dart';
import 'package:knowah/screens/item_list_screen.dart';

void main() {
    // TC06: clicking a recent project on the Menu opens the Item list
    testWidgets('TC06: Clicking a recent project opens the Item list', (tester) async {
        // Draw the Menu inside a minimal app
        await tester.pumpWidget(const MaterialApp(home: MenuScreen()));

        // Before clicking, the Item list should not be on screen
        expect(find.byType(ItemListScreen), findsNothing);

        // tester.tap pretends to press the button
        await tester.tap(find.text('Side-Scroller'));

        // pumpAndSettle waits for the screen change animation to finish
        await tester.pumpAndSettle();

        // Now the Item list should be on screen
        expect(find.byType(ItemListScreen), findsOneWidget);
    });

    // TC07: the Back button on the Item list returns to the Menu
    testWidgets('TC07: Back button returns to the Menu', (tester) async {
        // Draw the Menu and go to the Item list, same as TC06
        await tester.pumpWidget(const MaterialApp(home: MenuScreen()));
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
    });
}