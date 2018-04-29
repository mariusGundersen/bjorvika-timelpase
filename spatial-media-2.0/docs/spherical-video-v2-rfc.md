# Spherical Video V2 RFC (draft)
*This document describes a revised open metadata scheme by which MP4 (ISOBMFF)
multimedia containers may accommodate spherical videos. Comments are welcome by
discussing on the [Spatial Media Google
group](https://groups.google.com/forum/#!forum/spatial-media-discuss) or by
filing an [issue](https://github.com/google/spatial-media/issues/new) on
GitHub.*

------------------------------------------------------

## Metadata Format

### MP4 (ISOBMFF)
Spherical video metadata is stored in a new box, `sv3d`, defined in this RFC, in
an MP4 (ISOBMFF) container. The metadata is applicable to individual video
tracks in the container.

As the V2 specification stores its metadata in a different location, it is
possible for a file to contain both the V1 and V2 metadata. If both V1 and V2
metadata are contained they should contain semantically equivalent information,
with V2 taking priority when they differ.

#### Spherical Video Box (sv3d)
##### Definition
Box Type: `sv3d`  
Container: Video Sample Description box (e.g. `avc1`, `mp4v`, `apcn`)  
Mandatory: No  
Quantity: Zero or one

Stores additional information about spherical video content contained in this
video track.

##### Syntax
```
aligned(8) class SphericalVideoBox extends Box(‘sv3d’) {
}
```

#### Spherical Video Header (svhd)
##### Definition
Box Type: `svhd`  
Container: `sv3d`  
Mandatory: Yes  
Quantity: Exactly one

Contains spherical video information unrelated to the projection format.

##### Syntax
```
aligned(8) class SphericalVideoHeader extends FullBox(‘svhd’, 0, 0) {
    string metadata_source;
}
```

##### Semantics

- `metadata_source` is a string identifier for the source tool of the SV3D
metadata.

#### Projection Box (proj)
##### Definition
Box Type: `proj`  
Container: `sv3d`  
Mandatory: Yes  
Quantity: Exactly one

Container for projection information about the spherical video content.
This container must contain exactly one subtype of the Projection Data Box
(e.g. an `equi` box) that defines the spherical projection.

##### Syntax
```
aligned(8) class Projection extends Box(‘proj’) {
}
```

#### Projection Header Box (prhd)
##### Definition
Box Type: `prhd`  
Container: `proj`  
Mandatory: Yes  
Quantity: Exactly one

Contains projection information about the spherical video content that is
independent of the video projection.

##### Syntax
```
aligned(8) class ProjectionHeader extends FullBox(‘prhd’, 0, 0) {
    unsigned int(8) stereo_mode;

    int(32) pose_yaw_degrees;
    int(32) pose_pitch_degrees;
    int(32) pose_roll_degrees;
}
```

##### Semantics

- `stereo_mode` is an 8-bit unsigned integer that specifies the stereo frame
   layout. The values 0 to 255 are reserved for current and future layouts. The
   following values are defined:

| `stereo_mode` | Stereo Mode Description |
|:-----------------|:---------------------------|
|   `0`   | **Monoscopic**: Indicates the video frame contains a single monoscopic view. |
|   `1`   | **Stereoscopic Top-Bottom**: Indicates the video frame contains a stereoscopic view storing the left eye on top half of the frame and right eye at the bottom half of the frame.|
|   `2`   | **Stereoscopic Left-Right**: Indicates the video frame contains a stereoscopic view storing the left eye on left half of the frame and right eye on the right half of the frame.|

- Pose values are 16.16 fixed point values measuring rotation in degrees. These
  rotations transform the the projection as follows:
  - `pose_yaw_degrees` clockwise rotation by the up vector
  - `pose_pitch_degrees` counter-clockwise rotation over the right vector post
     yaw transform
  - `pose_roll_degrees` counter clockwise-rotation over the forward vector post
     yaw and pitch transform

#### Projection Data Box
##### Definition
Box Type: Projection Dependent Identifier  
Container: `proj`  
Mandatory: Yes  
Quantity: Exactly one

Base class for all projection data boxes. Any new projection must subclass this
type with a unique `proj_type`.

##### Syntax
```
aligned(8) class ProjectionDataBox(unsigned int(32) proj_type, unsigned int(32) version, unsigned int(32) flags)
    extends FullBox(proj_type, version, flags) {
}
```

#### Cubemap Projection Box (cbmp)
##### Definition
Box Type: `cbmp`  
Container: `proj`

Contains the projection dependent information for a cubemap video. The
[cubemap's](https://en.wikipedia.org/wiki/Cube_mapping) face layout is defined
by a unique `layout` value.

##### Syntax
```
aligned(8) class CubemapProjection ProjectionDataBox(‘cbmp’, 0, 0) {
    unsigned int(32) layout;
    unsigned int(32) padding;
}
```

##### Semantics
- `layout` is a 32-bit unsigned integer describing the layout of cube faces. The
  values 0 to 255 are reserved for current and future layouts.
  - a value of `0` corresponds to a grid with 3 columns and 2 rows. Faces are
    oriented upwards for the front, left, right, and back faces. The up face is
    oriented so the top of the face is forwards and the down face is oriented
    so the top of the face is to the back.
<center>
<table>
  <tr>
    <td>right face</td>
    <td>left face</td>
    <td>up face</td>
  </tr>
  <tr>
    <td>down face</td>
    <td>front face</td>
    <td>back face</td>
  </tr>
</table>
</center>

- `padding` is a 32-bit unsigned integer measuring the number of pixels to pad
    from the edge of each cube face.

#### Equirectangular Projection Box (equi)
##### Definition
Box Type: `equi`  
Container: `proj`

Contains the projection dependent information for a equirectangular video. The
[equirectangular projection](
https://en.wikipedia.org/wiki/Equirectangular_projection) should be arranged
such that the default pose has the forward vector in the center of the frame,
the up vector at top of the frame, and the right vector towards the right of the
frame.

##### Syntax
```
aligned(8) class EquirectangularProjection ProjectionDataBox(‘equi’, 0, 0) {
    unsigned int(32) projection_bounds_top;
    unsigned int(32) projection_bounds_bottom;
    unsigned int(32) projection_bounds_left;
    unsigned int(32) projection_bounds_right;
}
```

##### Semantics

- The projection bounds use 0.32 fixed point values. These values represent the
  proportion of projection cropped from each edge not covered by the video
  frame. For an uncropped frame all values are 0.
  - `projection_bounds_top` is the amount from the top of the frame to crop
  - `projection_bounds_bottom` is the amount from the bottom of the frame to
     crop; must be less than 0xFFFFFFFF - projection_bounds_top
  - `projection_bounds_left` is the amount from the left of the frame to crop
  - `projection_bounds_right` is the amount from the right of the frame to crop;
     must be less than 0xFFFFFFFF - projection_bounds_left

### Example

Here is an example box hierarchy for a file containing the SV3D metadata for a
monoscopic equirectangular video:

```
[moov: Movie Box]
  [mdia: Media Box]
    [minf: Media Information Box]
      [stbl: Sample Table Box]
        [stsd: Sample Table Sample Descriptor]
          [avc1: Advance Video Coding Box]
            [pasp: Pixel Aspect Ratio Box]
              ...
            [sv3d: Spherical Video Box]
              [svhd: Spherical Video Header Box]
                metadata_source = "Spherical Metadata Tooling"
              [proj: Projection Box]
                [prhd: Projection Header Box]
                  stereo_mode = 0
                  pose_yaw_degrees = 0
                  pose_pitch_degrees = 0
                  pose_roll_degrees = 0
                [equi: Equirectangular Projection Box]
                  projection_bounds_top = 0
                  projection_bounds_bottom = 0
                  projection_bounds_left = 0
                  projection_bounds_right = 0
```

