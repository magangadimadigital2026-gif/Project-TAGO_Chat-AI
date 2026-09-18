-- CreateTable
CREATE TABLE "Food" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "subcategory" TEXT NOT NULL,
    "taste" TEXT NOT NULL,
    "spicyLevel" INTEGER NOT NULL,
    "servingType" TEXT NOT NULL,
    "tags" TEXT[],
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "imageUrl" TEXT NOT NULL,
    "portion" TEXT NOT NULL,
    "dietary" TEXT NOT NULL,
    "ingredients" TEXT[],

    CONSTRAINT "Food_pkey" PRIMARY KEY ("id")
);
