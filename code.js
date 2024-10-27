// code.js
figma.showUI(__html__, { width: 300, height: 320 });


figma.ui.onmessage = (msg) => {
  if (msg.type === 'create-pattern') {
    const { rotationAngle, totalRotation } = msg;
    const selection = figma.currentPage.selection;

    if (selection.length !== 1) {
      figma.notify("Please select exactly one shape.");
      return;
    }

    let originalNode = selection[0];


    if (!('rotation' in originalNode)) {
      figma.notify("Selected item cannot be rotated. Please select a shape.");
      return;
    }

    // Calculate the width and height of the original shape
    const originalWidth = originalNode.width;
    const originalHeight = originalNode.height;

    // Generate a random ID for the pattern
    const patternId = Math.random().toString(36).substr(2, 9);

    // Create a frame with the dimensions of the original shape
    const frame = figma.createFrame();
    frame.resize(originalWidth, originalHeight);
    frame.fills = []; // Remove fill
    frame.clipsContent = false; // Turn off clip content
    frame.name = `${patternId}`; // Set a random name for the frame using the stored patternId

    // Place the original node inside the frame
    frame.appendChild(originalNode);
    originalNode.x = -originalWidth / 2;
    originalNode.y = -originalHeight / 2;

    // Replace the original node with the frame in the selection
    figma.currentPage.selection = [frame];
    
    // Update the originalNode reference to use the frame
    originalNode = frame; // Use the frame as the new original node

    let currentAngle = 0;
    let createdNodes = [originalNode];

    try {
      while (currentAngle <= totalRotation) {
        currentAngle += rotationAngle;
        if (currentAngle >= totalRotation) break;

        const newNode = originalNode.clone();
        newNode.rotation = currentAngle;

        createdNodes.push(newNode);
        figma.currentPage.appendChild(newNode);
      }
      
      // Flatten the selection
      const group = figma.group(createdNodes, figma.currentPage);
      const flattened = figma.flatten([group]);
      
      figma.currentPage.selection = [flattened];
      figma.viewport.scrollAndZoomIntoView([flattened]);
      figma.notify(`Created, centered, and flattened ${createdNodes.length} shapes in a circular pattern.`);
    } catch (error) {
      console.error("Error creating pattern:", error);
      figma.notify("An error occurred while creating the pattern. Check the console for details.");
    }
  }
};
