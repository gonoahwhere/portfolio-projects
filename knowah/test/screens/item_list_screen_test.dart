// Flutter's building blocks, needed to draw a test screen
import 'package:material_ui/material_ui.dart';

// testWidgets allows testing a screen without opening the app
import 'package:flutter_test/flutter_test.dart';

// The Item made in another file
import 'package:knowah/models/item.dart';

// This screen doesn't exist yet, so the test with fail (Red)
import 'package:knowah/screens/item_list_screen.dart';

void main() {
    // TC05: the list screen must show the title of every item it is given
    testWidgets('TC05: Item list shows the title of each item', (tester) async {
        // Two pretend items to show on the screen
        final items = [
            Item(title: 'Double Jump'),
            Item(title: 'Slime Enemy'),
        ];

        // Draw the screen with those items inside a minimal app
        await tester.pumpWidget(MaterialApp(home: ItemListScreen(items: items)));

        // Both titles should be somewhere on the screen
        expect(find.text('Double Jump'), findsOneWidget);
        expect(find.text('Slime Enemy'), findsOneWidget);
    });

    testWidgets('TC08: Tapping an item shows it in the details panel', (tester) async {
        // Maket he pretend window PC sized (wide)
        tester.view.physicalSize = const Size(1400, 900);
        tester.view.devicePixelRatio = 1.0;

        // Put the window size back to normal when the test ends
        addTearDown(tester.view.resetPhysicalSize);
        addTearDown(tester.view.resetDevicePixelRatio);

        final items = [
            Item(title: 'Double Jump'),
            Item(title: 'Slime Enemy'),
        ];

        await tester.pumpWidget(MaterialApp(home: ItemListScreen(items: items)));

        // Tap the first item in the list
        await tester.tap(find.text('Double Jump'));
        await tester.pumpAndSettle();

        // The details panel should exist
        expect(find.byKey(const Key('details-panel')), findsOneWidget);

        // it should contain the title of the item we tapped
        expect(
            find.descendant(
                of: find.byKey(const Key('details-panel')),
                matching: find.text('Double Jump'),
            ),
            findsOneWidget,
        );
    });

    // TC10: each row shows the status of its item
    testWidgets('TC10: Item list shows the status of each item', (tester) async {
        final items = [
            // Active is given, Draft is the default
            Item(title: 'Double Jump', status: ItemStatus.active),
            Item(title: 'Level 2'),
        ];

        await tester.pumpWidget(MaterialApp(home: ItemListScreen(items: items)));

        // Each status should appear once, next to its item
        expect(find.text('Active'), findsOneWidget);
        expect(find.text('Draft'), findsOneWidget);
    });

    // TC13: on a narrow window, tapping an item opens its details on a separate screen
    testWidgets('TC13: Tapping an item on a narrow window opens its details', (tester) async {
        // Make the pretend window narrow (phone sized)
        tester.view.physicalSize = const Size(400, 800);
        tester.view.devicePixelRatio = 1.0;

        // Put the window size back to normal when the test ends
        addTearDown(tester.view.resetPhysicalSize);
        addTearDown(tester.view.resetDevicePixelRatio);

        final items = [
            Item(title: 'Double Jump', status: ItemStatus.active),
            Item(title: 'Level 2'),
        ];

        await tester.pumpWidget(MaterialApp(home: ItemListScreen(items: items)));

        // There is no details screen before the tap
        expect(find.byKey(const Key('details-screen')), findsNothing);

        // Tap the first item
        await tester.tap(find.text('Double Jump'));
        await tester.pumpAndSettle();

        // The details screen should now be showing
        expect(find.byKey(const Key('details-screen')), findsOneWidget);

        // it should contain the title of the item we tapped
        expect(
            find.descendant(
                of: find.byKey(const Key('details-screen')),
                matching: find.text('Double Jump'),
            ),
            findsOneWidget,
        );
    });
}