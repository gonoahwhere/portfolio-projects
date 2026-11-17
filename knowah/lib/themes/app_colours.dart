// Imports Flutter's ready-made building blocks
import 'package:material_ui/material_ui.dart';

// Every colour used in the app lives here, so a palette change is a one file job
// Nothing ever creates an AppColours object, it is just a shelf to read colours from
class AppColours {
    // The page background behind everything
    static const Color background = Color(0xFF0A0D18);

    // Normal text colour
    static const Color text = Color(0xFFE7EAF6);

    // Main accent colour (title, main buttons);
    static const Color cyan = Color(0xFF5EEAD4);

    // Quite accent colour (subheadings, secondary buttons);
    static const Color textDim = Color(0xFF8A90B3);

    // Shadow colours for the 3D effect
    // These are solid (not see-through) on purpose due to stacked
    // see-through shadows overlap and show stripes where they cross
    static const Color cyanShadow = Color(0xFF1F6B60);
    static const Color textDimShadow = Color(0xFF3A4075);
} 