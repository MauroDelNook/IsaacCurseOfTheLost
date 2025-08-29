import pygame
import sys

# Initialize pygame
pygame.init()

# Constants
GRID_SIZE = 13
CELL_SIZE = 40
GRID_MARGIN = 50
WINDOW_SIZE = GRID_SIZE * CELL_SIZE + 2 * GRID_MARGIN
BG_COLOR = (30, 30, 40)
GRID_COLOR = (80, 80, 100)
MARKED_COLOR = (0, 200, 150)
HOVER_COLOR = (100, 100, 130)
TEXT_COLOR = (220, 220, 220)

# Create the window
screen = pygame.display.set_mode((WINDOW_SIZE, WINDOW_SIZE))
pygame.display.set_caption("Grid Marker - 13x13")

# Create a 2D list to track marked cells (0 = unmarked, 1 = marked)
marked_cells = [[0 for _ in range(GRID_SIZE)] for _ in range(GRID_SIZE)]

# Font for coordinates
font = pygame.font.SysFont(None, 20)

def draw_grid():
    """Draw the grid and marked cells"""
    # Draw background
    screen.fill(BG_COLOR)
    
    # Draw grid lines
    for i in range(GRID_SIZE + 1):
        # Vertical lines
        pygame.draw.line(
            screen, 
            GRID_COLOR, 
            (GRID_MARGIN + i * CELL_SIZE, GRID_MARGIN),
            (GRID_MARGIN + i * CELL_SIZE, GRID_MARGIN + GRID_SIZE * CELL_SIZE),
            2 if i % 5 == 0 else 1  # Thicker lines every 5 cells
        )
        # Horizontal lines
        pygame.draw.line(
            screen, 
            GRID_COLOR, 
            (GRID_MARGIN, GRID_MARGIN + i * CELL_SIZE),
            (GRID_MARGIN + GRID_SIZE * CELL_SIZE, GRID_MARGIN + i * CELL_SIZE),
            2 if i % 5 == 0 else 1  # Thicker lines every 5 cells
        )
    
    # Draw marked cells
    for row in range(GRID_SIZE):
        for col in range(GRID_SIZE):
            if marked_cells[row][col]:
                pygame.draw.rect(
                    screen, 
                    MARKED_COLOR, 
                    (GRID_MARGIN + col * CELL_SIZE + 2, 
                     GRID_MARGIN + row * CELL_SIZE + 2, 
                     CELL_SIZE - 4, 
                     CELL_SIZE - 4)
                )
    
    # Draw coordinates
    for i in range(GRID_SIZE):
        # Column labels (A-M)
        col_label = font.render(chr(65 + i), True, TEXT_COLOR)
        screen.blit(col_label, (GRID_MARGIN + i * CELL_SIZE + CELL_SIZE//2 - 5, GRID_MARGIN - 25))
        
        # Row labels (1-13)
        row_label = font.render(str(i+1), True, TEXT_COLOR)
        screen.blit(row_label, (GRID_MARGIN - 25, GRID_MARGIN + i * CELL_SIZE + CELL_SIZE//2 - 8))
    
    # Draw title
    title_font = pygame.font.SysFont(None, 36)
    title = title_font.render("13x13 Grid Marker", True, TEXT_COLOR)
    screen.blit(title, (WINDOW_SIZE//2 - title.get_width()//2, 10))
    
    # Draw instructions
    instructions = font.render("Click to mark/unmark cells | Press 'C' to clear all", True, TEXT_COLOR)
    screen.blit(instructions, (WINDOW_SIZE//2 - instructions.get_width()//2, WINDOW_SIZE - 30))

def get_cell_from_pos(pos):
    """Convert mouse position to grid cell coordinates"""
    x, y = pos
    # Check if the position is within the grid
    if (GRID_MARGIN <= x < GRID_MARGIN + GRID_SIZE * CELL_SIZE and 
        GRID_MARGIN <= y < GRID_MARGIN + GRID_SIZE * CELL_SIZE):
        col = (x - GRID_MARGIN) // CELL_SIZE
        row = (y - GRID_MARGIN) // CELL_SIZE
        return row, col
    return None

def draw_hover_cell(pos):
    """Draw a highlight on the cell under the mouse"""
    cell = get_cell_from_pos(pos)
    if cell:
        row, col = cell
        pygame.draw.rect(
            screen, 
            HOVER_COLOR, 
            (GRID_MARGIN + col * CELL_SIZE + 2, 
             GRID_MARGIN + row * CELL_SIZE + 2, 
             CELL_SIZE - 4, 
             CELL_SIZE - 4),
            2
        )

# Main game loop
clock = pygame.time.Clock()
running = True

while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        elif event.type == pygame.MOUSEBUTTONDOWN:
            if event.button == 1:  # Left mouse button
                cell = get_cell_from_pos(event.pos)
                if cell:
                    row, col = cell
                    # Toggle the marked state
                    marked_cells[row][col] = 1 - marked_cells[row][col]
        elif event.type == pygame.KEYDOWN:
            if event.key == pygame.K_c:  # Clear all when 'C' is pressed
                marked_cells = [[0 for _ in range(GRID_SIZE)] for _ in range(GRID_SIZE)]
    
    # Draw everything
    draw_grid()
    
    # Draw hover effect
    mouse_pos = pygame.mouse.get_pos()
    draw_hover_cell(mouse_pos)
    
    pygame.display.flip()
    clock.tick(60)

pygame.quit()
sys.exit()