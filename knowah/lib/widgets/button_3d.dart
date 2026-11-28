// Imports Flutter's ready-made building blocks
import 'package:material_ui/material_ui.dart';

// Knowahs colours
import 'package:knowah/themes/app_colours.dart';

// The 3D text helper
import 'package:knowah/themes/effects.dart';

// A button with a solid 3D edge that squashes down when pressed
// Used on every screen, so it lives here instead of inside one specific screen
// StatefulWidget because it changes while the app runs (pressed or not pressed)
class Button3D extends StatefulWidget {
    // The text shown inside the button
    final String label;

    // What happens when the button is clicked
    final VoidCallback onPressed;

    // true = main cyan button, false = quieter grey-blue button
    final bool cyan;

    // true = red button, used for actions like Cancel
    final bool red;

    const Button3D({
        super.key,
        required this.label,
        required this.onPressed,
        this.cyan = false,
        this.red = false
    });

    @override
    State<Button3D> createState() => _Button3DState();
}

// This is the part that remembers whether the button is currently pressed
class _Button3DState extends State<Button3D> {
    // Is something currently holding the button down?
    bool _pressed = false;

    // How many pixels thick the 3D edge is
    // When pressed, the button moves this far, so it sits exactly on its edge
    static const double _depth = 5;

    @override
    Widget build(BuildContext context) {
        // Pick the colours: red takes priority, then cyan, then grey-blue
        final Color accent = widget.red ? AppColours.red : widget.cyan ? AppColours.cyan : AppColours.textDim;
        final Color edge = widget.red ? AppColours.redShadow : widget.cyan ? AppColours.cyanShadow : AppColours.textDimShadow;

        // GestureDetector listens for clicks, since the button is custom made
        return GestureDetector(
            // Finger/mouse goes down
            onTapDown: (_) => setState(() => _pressed = true),
            // Finger/mouse comes up (full tap/click)
            onTapUp: (_) => setState(() => _pressed = false),
            // Finger/mouse slid away before letting go, so it wasn't a click
            onTapCancel: () => setState(() => _pressed = false),
            // The actual click, runs whatever the screen gave us
            onTap: widget.onPressed,

            // AnimatedContainer smoothly slides between its old and new look
            child: AnimatedContainer(
                // How long the slides take
                duration: const Duration(milliseconds: 80),
                // Same minimum height
                constraints: const BoxConstraints(minHeight: 50),
                // When pressed, slide down and right by the edge thickness
                transform: Matrix4.translationValues(
                    _pressed ? _depth : 0,
                    _pressed ? _depth: 0,
                    0,
                ),

                // Space inside the button, both up and down
                padding: const EdgeInsets.symmetric(vertical: 14),
                // Keeps the label in the middle
                alignment: Alignment.center,
                decoration: BoxDecoration(
                // Solid fill so that the 3D edge can't show through
                // The main button gets a faint cyan tint on top of the background
                // Buttons such as Cancel are red
                color: widget.red
                    ? Color.alphaBlend(
                        AppColours.red.withValues(alpha: 0.1),
                        AppColours.background,
                    )
                    : widget.cyan
                        ? Color.alphaBlend(
                            AppColours.cyan.withValues(alpha: 0.1),
                            AppColours.background,
                        )
                        : AppColours.background,
                    
                    // Slightly rounded corners
                    borderRadius: BorderRadius.circular(4),
                    // Border colour and thickness
                    border: Border.all(
                        color: accent.withValues(alpha: 0.5),
                        width: 2,
                    ),
                    // The 3D edge: a sharp shadow down and right
                    // When pressed it disappears, as the button has moved onto it
                    boxShadow: _pressed
                        ? [] : [
                            BoxShadow(
                                color: edge,
                                offset: const Offset(_depth, _depth),
                                blurRadius: 0,
                            ),
                        ],
                ),

                child: Text(
                    widget.label,
                    style: TextStyle(
                        fontSize: 16,
                        fontFamily: 'Sniglet',
                        color: accent,
                        // The 3D on the text, same colour as the button's edge
                        shadows: extrude(edge, 2)
                    ),
                ),
            ),
        );
    }
}