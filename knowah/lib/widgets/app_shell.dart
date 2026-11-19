// Imports Flutter's ready-made building blocks
import 'package:material_ui/material_ui.dart';

// Knowah colours
import 'package:knowah/themes/app_colours.dart';

// The 3D text helpers
import 'package:knowah/widgets/text_3d.dart';
import 'package:knowah/themes/effects.dart';

// Wraps a scene with the app's menu
// On a wide window (PC) the menu is a sidebar on the left
// StatelessWidget because it never changes once it is drawn
class AppShell extends StatelessWidget {
    // The menu entries, in order
    static const List<String> _entries = [
        'Dashboard',
        'Items',
        'Board',
        'Searches',
        'Export',
    ];

    // The short labels the mobile bar uses
    // The key is the full name, the value is what the bar shows
    static const Map<String, String> _shortLabels = {
        'Dashboard': 'Home',
        'Items': 'Items',
        'Board': 'Board',
        'Searches': 'Saved',
        'Export': 'Export',
    };

    // Which entry is the current screen, highlighted cyan
    final String active;

    // The screen's own content, shown next to the menu
    final Widget child;

    const AppShell({
        super.key,
        required this.active,
        required this.child,
    });

    @override
    Widget build(BuildContext context) {
        // LayoutBuilder tells us how much width we have to work with
        return LayoutBuilder(
            builder: (context, constraints) {
                // Wider than 700 pixels counts as a PC layout
                final isWide = constraints.maxWidth > 700;

                if (isWide) {
                    // Rows puts the sidebar and the content side by side
                    return Row(
                        // Makes the sidebar as tall as the window, so its edge line runs top to bottom
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                            _sidebar(),
                            // Expanded makes the content fill the rest of the width
                            Expanded(child: child),
                        ],
                    );
                }

                // Mobile: the content on top, the menu bar along the bottom
                // Column stacks its children from the top to bottom
                return Column(
                    children: [
                        // Expanded makes the content fill all the space above the bar
                        Expanded(child: child),
                        _bottomNav(),
                    ],
                );
            },
        );
    }

    // The menu down the left side
    Widget _sidebar() {
        return Container(
            // The name tag the TC11 test uses to find the sidebar
            key: const Key('sidebar'),
            width: 200,
            padding: const EdgeInsets.symmetric(vertical: 16),
            // A thin line down the right edge
            decoration: const BoxDecoration(
                border: Border(right: BorderSide(color: AppColours.border)),
            ),
            child: Column(
                // Lines the entries up on the left
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                    // The app name, in the same 3D font as the main menu
                    // Center puts it in the middle of the sidebar's WDITH
                    Center(
                        child: Text(
                            'KNOWAH', 
                            style: TextStyle(
                                fontFamily: 'RubikDirt',
                                fontSize: 30,
                                color: AppColours.text,
                                shadows: extrude(AppColours.cyanShadow, 3),
                            )
                        ),
                    ),
                    const SizedBox(height: 24),

                    // One line for every menu entry
                    for (final label in _entries) _entry(label),
                ],
            ),
        );
    }

    // The menu along the bottom of the screen
    Widget _bottomNav() {
        return Container(
            // The name tag the TC12 test uses to find the bar
            key: const Key('bottom-nav'),

            // Always full width of the screen
            width: double.infinity,
            
            // Only up and down padding, so the labels get all the width
            padding: const EdgeInsets.symmetric(vertical: 14),

            // A thin line along the top edge
            decoration: const BoxDecoration(
                border: Border(top: BorderSide(color: AppColours.border)),
            ),
            child: Row(
                children: [
                    // One label for every menu entry
                    for (final label in _entries)
                        // Expanded gives every label an equal share of the width
                        Expanded(
                            // Center puts the label in the middle of its share
                            child: Center(
                                // FittedBox shrinks the label if it doesn't fit, instead of overflowing
                                child: FittedBox(
                                    fit: BoxFit.scaleDown,
                                    child: Text3D(
                                        _shortLabels[label]!,
                                        fontSize: 13,
                                        // The current screen is cyan, the others are grey-blue
                                        colour: label == active
                                            ? AppColours.cyan
                                            : AppColours.textDim,
                                    ),
                                ),
                            ),
                        ),
                ],
            ),

        );
    }

    // One menu entry
    Widget _entry(String label) {
        // The current screen is cyan, the others are the quieter grey-blue
        final bool isActive = label == active;

        return Container(
            // Stretches the entry to the full width of the sidebar
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            // The current screen gets a faint cyan background
            color: isActive
                ? AppColours.cyan.withValues(alpha: 0.08)
                : null,
            child: Text3D(
                label,
                colour: isActive ? AppColours.cyan : AppColours.textDim,
            ),
        );
    }
}