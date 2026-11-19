// Flutter's ready-made building blocks
import 'package:material_ui/material_ui.dart';

// Knowah colours and the 3D text helpers
import 'package:knowah/themes/app_colours.dart';
import 'package:knowah/themes/effects.dart';

// Text with a solid 3D edge that always matches the text's own colour
// This is used anywhere the text needs a 3D look, instead of just plain Text
// StatelessWidget because it never changes once it is drawn
class Text3D extends StatelessWidget {
    // The words to show
    final String text;

    // The text colour, the 3D edge colour is picked from this
    final Color colour;

    // How big the text is
    final double fontSize;

    // How many pixels this the 3D edge is
    final int depth;

    const Text3D(
        this.text, {
            super.key,
            this.colour = AppColours.text,
            this.fontSize = 16,
            this.depth = 2,
        }
    );

    @override
    Widget build (BuildContext context) {
        return Text(
            text,
            style: TextStyle(
                fontSize: fontSize,
                color: colour,
                // The edge colour follows the text colour
                shadows: extrude(shadowFor(colour), depth),
            ),
        );
    }
}