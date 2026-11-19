// Flutter's ready-made building blocks
import 'package:material_ui/material_ui.dart';

// Knowah colours
import 'package:knowah/themes/app_colours.dart';

// A box with a solid 3D edge, for anything that isn't a button
// (list rows, cards, info panels, dialogs)
// Picks the colours the same way Button3D does, so its consistent
// It never moves, if onTap is given, it lights up cyan while held instead
// StatefulWidget because it changes while the app runs (held or not held)
class Panel3D extends StatefulWidget {
    // Whatever goes inside the box
    final Widget child;

    // Space between the box's border and what's inside it
    final EdgeInsetsGeometry padding;

    // true = main cyan panel, false = quieter grey-blue panel
    // Used to show the selected item/row
    final bool filled;

    // How many pixels thick the 3D edge is
    final double depth;

    // What happens when the panel is tapped
    // null means it isn't tappable and never moves (details panel, info boxes)
    final VoidCallback? onTap;

    const Panel3D({
        super.key,
        required this.child,
        this.padding = const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        this.filled = false,
        this.depth = 5,
        this.onTap,
    });

    @override
    State<Panel3D> createState() => _Panel3DState();
}

// This is the part that remembers whether the panel is currently held down
class _Panel3DState extends State<Panel3D> {
    // Is something currently holding the panel down?
    bool _held = false;

    // Only tappable panels can be pressed
    bool get _tappable => widget.onTap != null;

    @override
    Widget build(BuildContext context) {
        // cyan if it's selected, or if it's tappable and being held right now
        final bool lit = widget.filled || (_tappable && _held);

        // Pick the colours: cyan for the main button, grey-blue for the rest
        final Color accent = lit ? AppColours.cyan : AppColours.textDim;
        final Color edge = lit ? AppColours.cyanShadow : AppColours.textDimShadow;

        // GestureDetector listens for taps
        // If onTap is null, these do nothing
        return GestureDetector(
            // Finger/mouse goes down
            onTapDown: (_) {
                if (_tappable) setState(() => _held = true);
            },
            // Finger/mouse comes up (full tap/click)
            onTapUp: (_) {
                if (_tappable) setState(() => _held = false);
            },
            // Finger/mouse slid away before letting go, so it wasn't a valid click
            onTapCancel: () {
                if (_tappable) setState(() => _held = false);
            },
            // The actual click, runs whatever the screen gave us
            onTap: widget.onTap,

            child: Container(
                padding: widget.padding,
                decoration: BoxDecoration(
                    // Solid fill so the 3D edge can't show through
                    // The main panel gets a faint cyan tint on top of the background
                    color: lit
                        ? Color.alphaBlend(
                            AppColours.cyan.withValues(alpha: 0.1),
                            AppColours.background,
                        )
                        : AppColours.background,

                    // Slightly rounded corners, same as the buttons
                    borderRadius: BorderRadius.circular(4),
                    // Same border as the buttons: the accent colour at half strength
                    border: Border.all(
                        color: accent.withValues(alpha: 0.5),
                        width: 2,
                    ),

                    // The 3D edge: a sharp shadow down and right
                    boxShadow: [
                        BoxShadow(
                            color: edge,
                            offset: Offset(widget.depth, widget.depth),
                            blurRadius: 0,
                        ),
                    ],
                ),
                child: widget.child,
            ),
        );
    }
}