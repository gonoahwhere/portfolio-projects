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
                        children: [
                            _sidebar(),
                            // Expanded makes the content fill the rest of the width
                            Expanded(child: child),
                        ],
                    );
                }

                // Mobile: just the content for now
                return child;
            },
        );
    }

    // The menu down the left side
    Widget _sidebar() {
        return Container(
            // The name tag the TC11 test uses to find the sidebar
            key: const Key('sidebar'),
            width: 160,
            padding: const EdgeInsets.symmetric(vertical: 16),
            // A thin line down the right edge
            decoration: const BoxDecoration(
                border: Border(right: BorderSide(color: AppColours.border)),
            ),
            child: Column(
                // Lines the entries up on the left
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                    // The app name at the top
                    Padding(
                        padding: EdgeInsets.symmetric(horizontal: 16),
                        child: Text(
                            'KNOWAH', 
                            style: TextStyle(
                                fontFamily: 'RubikDirt',
                                fontSize: 22,
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