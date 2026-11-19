// Imports Flutter's ready-made building blocks
import 'package:material_ui/material_ui.dart';

// testWidgets allows testing a screen without opening the app
import 'package:flutter_test/flutter_test.dart';

// This screen doesn't exist yet, so the test with fail (Red)
import 'package:knowah/widgets/app_shell.dart';

void main() {
    // TC11: on a wide window, the shell shows a sidebar with the 5 menu entries
    testWidgets('TC11: Wide window shows the sidebar menu', (tester) async {
        // Make the pretend window PC sized
        tester.view.physicalSize = const Size(1400, 900);
        tester.view.devicePixelRatio = 1.0;

        // Puts the window size back to normal when the test ends
        addTearDown(tester.view.resetPhysicalSize);
        addTearDown(tester.view.resetDevicePixelRatio);

        // Draw the shell around some pretend content
        await tester.pumpWidget(const MaterialApp(
            home: AppShell(active: 'Items', child: Text('content')),
        ));

        // The sidebar should exist, and the bottom bar should not
        expect(find.byKey(const Key('sidebar')), findsOneWidget);
        expect(find.byKey(const Key('bottom-nav')), findsNothing);

        // All 5 entries should be in the sidebar
        for (final label in ['Dashboard', 'Items', 'Board', 'Searches', 'Export']) {
            expect(find.text(label), findsOneWidget);
        }

        // The content we passed in should still be shown
        expect(find.text('content'), findsOneWidget);
    });
}