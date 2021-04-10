import setuptools

setuptools.setup(
    name='simple_api_frontend',
    version='0.9',
    packages=setuptools.find_packages(),
    url='',
    license='MIT',
    author='Ladislav Louka',
    author_email='ladislav.louka@gmail.com',
    description='Basic web manager for Simple API generated service',
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    install_requires=[
        "django>=3.0.14"
    ],
    python_requires='>=3.6',
)
