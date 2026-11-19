// Imports Flutter's ready-made building blocks
import 'package:material_ui/material_ui.dart';

// Knowah colours
import 'package:knowah/themes/app_colours.dart';

// Builds a solid 'extruded' 3D look for text
// color = the colour of the 3D edge
// depth = how many pixels thick the edge is
// It stacks one shadow per pixel, each 1px further down and right than the last
// blurRadius: 0 keeps every shadow sharp instead of fuzzy
List<Shadow> extrude(Color color, int depth) => [
    for (int i = 1; i <= depth; i++)
        Shadow(
            offset: Offset(i.toDouble(), i.toDouble()),
            blurRadius: 0,
            color: color,
        ),
];

// Picks the 3D edge colour that goes with a text colour
// Each text colour has its own edge colour
Color shadowFor(Color textColour) {
    // Cyan text gets the dark cyan edge
    if (textColour == AppColours.cyan) return AppColours.cyanShadow;
    // Grey-blue text gets the dark gey-blue edge
    if (textColour == AppColours.textDim) return AppColours.textDimShadow;
    // Everything else gets the lighter edge
    return AppColours.textShadow;
}