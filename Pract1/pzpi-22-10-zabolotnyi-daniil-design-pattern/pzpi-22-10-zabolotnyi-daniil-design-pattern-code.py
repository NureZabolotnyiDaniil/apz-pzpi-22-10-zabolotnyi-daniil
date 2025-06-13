class MedicalImage:
    def display(self): pass


class FullImage(MedicalImage):
    def __init__(self, filename):
        self._load_image(filename)
    
    def _load_image(self, filename):
        print(f"Завантаження {filename} (4 ГБ)...")
    
    def display(self):
        print("Відображення повного зображення")


class ImageProxy(MedicalImage):
    def __init__(self, filename):
        self.filename = filename
        self.full_image = None
        self.thumbnail = self._load_thumbnail() 
    
    def _load_thumbnail(self):
        print(f"Завантаження мініатюри {self.filename} (50 КБ)")
        return "[Мініатюра]"
    
    def display(self):
        if self.full_image is None:
            self.full_image = FullImage(self.filename)
        self.full_image.display()


image = ImageProxy("brain_scan.mri")
image.display()
